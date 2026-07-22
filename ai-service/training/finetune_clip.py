from __future__ import annotations

import argparse
import logging
from pathlib import Path
from typing import Optional

import open_clip
import torch
import torch.nn.functional as F
from torch.utils.data import DataLoader

from training.stanford_dogs_dataset import StanfordDogsDataset

logger = logging.getLogger(__name__)

DEFAULT_MODEL_NAME = "ViT-B-32"
DEFAULT_PRETRAINED = "laion2b_s34b_b79k"


# Carregamento do modelo 
def load_trainable_model(
    model_name: str,
    pretrained: str,
    device: torch.device,
):
    """Carrega uma instância própria do OpenCLIP, em modo de treino."""
    model, _, preprocess = open_clip.create_model_and_transforms(
        model_name, pretrained=pretrained, device=device
    )
    tokenizer = open_clip.get_tokenizer(model_name)
    model.train()
    return model, preprocess, tokenizer



# Estratégia de congelamento (limitar overfitting)
def _freeze_all(model: torch.nn.Module) -> None:
    for param in model.parameters():
        param.requires_grad = False


def _unfreeze_last_n_blocks(blocks, n: int) -> None:
    if n <= 0:
        return
    for block in blocks[-n:]:
        for param in block.parameters():
            param.requires_grad = True


def configure_trainable_parameters(
    model: torch.nn.Module,
    freeze_visual: bool = True,
    freeze_text: bool = True,
    unfreeze_last_n_visual: int = 2,
    unfreeze_last_n_text: int = 2,
) -> None:
    
    _freeze_all(model)

    model.logit_scale.requires_grad = True
    if getattr(model.visual, "proj", None) is not None:
        model.visual.proj.requires_grad = True
    if hasattr(model, "text_projection"):
        model.text_projection.requires_grad_(True)

    if not freeze_visual:
        for param in model.visual.parameters():
            param.requires_grad = True
    else:
        _unfreeze_last_n_blocks(model.visual.transformer.resblocks, unfreeze_last_n_visual)

    if not freeze_text:
        for param in model.transformer.parameters():
            param.requires_grad = True
        model.token_embedding.requires_grad_(True)
        model.positional_embedding.requires_grad = True
    else:
        _unfreeze_last_n_blocks(model.transformer.resblocks, unfreeze_last_n_text)

    model.ln_final.requires_grad_(True)

    trainable = sum(p.numel() for p in model.parameters() if p.requires_grad)
    total = sum(p.numel() for p in model.parameters())
    logger.info(
        "Parâmetros treináveis: %d / %d (%.1f%%)",
        trainable, total, 100 * trainable / total,
    )



# Loss contrastivo 
def clip_contrastive_loss(
    image_features: torch.Tensor,
    text_features: torch.Tensor,
    logit_scale: torch.Tensor,
) -> torch.Tensor:
    
    logits_per_image = logit_scale * image_features @ text_features.t()
    logits_per_text = logits_per_image.t()

    batch_size = image_features.shape[0]
    labels = torch.arange(batch_size, device=image_features.device)

    loss_image = F.cross_entropy(logits_per_image, labels)
    loss_text = F.cross_entropy(logits_per_text, labels)
    return (loss_image + loss_text) / 2



# Loop de treino
def _select_device(device_override: Optional[str]) -> torch.device:
    if device_override:
        return torch.device(device_override)
    if torch.cuda.is_available():
        return torch.device("cuda")
    return torch.device("cpu")


def _run_epoch(
    model, dataloader, optimizer, device, max_logit_scale, train: bool
) -> float:
    model.train(mode=train)
    total_loss = 0.0
    total_batches = 0

    context = torch.enable_grad() if train else torch.no_grad()
    with context:
        for images, texts, _breeds, _captions in dataloader:
            images = images.to(device)
            texts = texts.to(device)

            image_features = model.encode_image(images)
            text_features = model.encode_text(texts)

            image_features = F.normalize(image_features, dim=-1)
            text_features = F.normalize(text_features, dim=-1)

            # Clamp evita que logit_scale exploda durante o treino 
            logit_scale = model.logit_scale.clamp(max=max_logit_scale).exp()

            loss = clip_contrastive_loss(image_features, text_features, logit_scale)

            if train:
                optimizer.zero_grad()
                loss.backward()
                optimizer.step()

            total_loss += loss.item()
            total_batches += 1

    return total_loss / max(total_batches, 1)


def finetune(
    stanford_dogs_root: Path,
    caption_cache_path: Path,
    output_dir: Path,
    model_name: str = DEFAULT_MODEL_NAME,
    pretrained: str = DEFAULT_PRETRAINED,
    epochs: int = 5,
    batch_size: int = 64,
    learning_rate: float = 1e-6,
    freeze_visual: bool = True,
    freeze_text: bool = True,
    unfreeze_last_n_visual: int = 2,
    unfreeze_last_n_text: int = 2,
    max_logit_scale: float = 4.6052,  # ln(100) padrão do CLIP 
    device_override: Optional[str] = None,
    num_workers: int = 2,
) -> Path:
    #Roda o fine-tuning e salva o melhor checkpoint (menor loss de validação) em `output_dir/clip_finetuned_best.pt`.
    device = _select_device(device_override)
    logger.info("Usando device: %s", device)

    model, preprocess, tokenizer = load_trainable_model(model_name, pretrained, device)
    configure_trainable_parameters(
        model,
        freeze_visual=freeze_visual,
        freeze_text=freeze_text,
        unfreeze_last_n_visual=unfreeze_last_n_visual,
        unfreeze_last_n_text=unfreeze_last_n_text,
    )

    train_dataset = StanfordDogsDataset(
        root_dir=stanford_dogs_root,
        image_transform=preprocess,
        tokenizer=tokenizer,
        split="train",
        caption_cache_path=caption_cache_path,
    )
    val_dataset = StanfordDogsDataset(
        root_dir=stanford_dogs_root,
        image_transform=preprocess,
        tokenizer=tokenizer,
        split="val",
        caption_cache_path=caption_cache_path,
    )

    logger.info(
        "Cobertura do cache de legendas — treino: %.1f%% | validação: %.1f%%",
        train_dataset.stats.cache_coverage * 100,
        val_dataset.stats.cache_coverage * 100,
    )

    train_loader = DataLoader(
        train_dataset, batch_size=batch_size, shuffle=True,
        num_workers=num_workers, drop_last=True,
    )
    val_loader = DataLoader(
        val_dataset, batch_size=batch_size, shuffle=False,
        num_workers=num_workers,
    )

    trainable_params = [p for p in model.parameters() if p.requires_grad]
    optimizer = torch.optim.AdamW(trainable_params, lr=learning_rate, weight_decay=0.01)

    output_dir.mkdir(parents=True, exist_ok=True)
    best_checkpoint_path = output_dir / "clip_finetuned_best.pt"
    best_val_loss = float("inf")

    for epoch in range(1, epochs + 1):
        train_loss = _run_epoch(model, train_loader, optimizer, device, max_logit_scale, train=True)
        val_loss = _run_epoch(model, val_loader, optimizer, device, max_logit_scale, train=False)

        logger.info(
            "Época %d/%d — loss treino: %.4f | loss validação: %.4f",
            epoch, epochs, train_loss, val_loss,
        )

        if val_loss < best_val_loss:
            best_val_loss = val_loss
            torch.save(model.state_dict(), best_checkpoint_path)
            logger.info("Novo melhor checkpoint salvo em '%s' (loss=%.4f).", best_checkpoint_path, val_loss)

    logger.info("Treino concluído. Melhor loss de validação: %.4f", best_val_loss)
    return best_checkpoint_path


def _parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Fine-tuning contrastivo do OpenCLIP no Stanford Dogs.")
    parser.add_argument("stanford_dogs_root", type=Path)
    parser.add_argument("caption_cache_path", type=Path)
    parser.add_argument("output_dir", type=Path)
    parser.add_argument("--model-name", default=DEFAULT_MODEL_NAME)
    parser.add_argument("--pretrained", default=DEFAULT_PRETRAINED)
    parser.add_argument("--epochs", type=int, default=5)
    parser.add_argument("--batch-size", type=int, default=64)
    parser.add_argument("--learning-rate", type=float, default=1e-6)
    parser.add_argument("--unfreeze-last-n-visual", type=int, default=2)
    parser.add_argument("--unfreeze-last-n-text", type=int, default=2)
    parser.add_argument("--full-finetune-visual", action="store_true", help="Descongela a torre visual inteira")
    parser.add_argument("--full-finetune-text", action="store_true", help="Descongela a torre de texto inteira")
    parser.add_argument("--device", default=None)
    parser.add_argument("--num-workers", type=int, default=2)
    return parser.parse_args()


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    args = _parse_args()

    finetune(
        stanford_dogs_root=args.stanford_dogs_root,
        caption_cache_path=args.caption_cache_path,
        output_dir=args.output_dir,
        model_name=args.model_name,
        pretrained=args.pretrained,
        epochs=args.epochs,
        batch_size=args.batch_size,
        learning_rate=args.learning_rate,
        freeze_visual=not args.full_finetune_visual,
        freeze_text=not args.full_finetune_text,
        unfreeze_last_n_visual=args.unfreeze_last_n_visual,
        unfreeze_last_n_text=args.unfreeze_last_n_text,
        device_override=args.device,
        num_workers=args.num_workers,
    )
