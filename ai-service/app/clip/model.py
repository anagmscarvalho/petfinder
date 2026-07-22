from __future__ import annotations

import logging
import os
import threading
from dataclasses import dataclass
from typing import Callable, Optional

import torch
import open_clip

logger = logging.getLogger(__name__)



# Configuração padrão
DEFAULT_MODEL_NAME = os.getenv("CLIP_MODEL_NAME", "ViT-B-32")
DEFAULT_PRETRAINED = os.getenv("CLIP_PRETRAINED", "laion2b_s34b_b79k")
DEFAULT_DEVICE = os.getenv("CLIP_DEVICE")  # None => seleção automática
 
CLIP_FINETUNED_CHECKPOINT = os.getenv("CLIP_FINETUNED_CHECKPOINT")


@dataclass(frozen=True) # É frozen p/evitar que algum módulo substitua o modelo em tempo de execução
class CLIPBundle:

    model: torch.nn.Module
    preprocess: Callable
    tokenizer: Callable
    device: torch.device
    model_name: str
    pretrained: str

    def __repr__(self) -> str:  # pragma: no cover - apenas cosmético
        return (
            f"CLIPBundle(model_name={self.model_name!r}, "
            f"pretrained={self.pretrained!r}, device={self.device})"
        )


class _CLIPModelLoader:

    _instance: Optional["_CLIPModelLoader"] = None
    _instance_lock = threading.Lock()

    def __new__(cls) -> "_CLIPModelLoader":
        if cls._instance is None:
            with cls._instance_lock:
                if cls._instance is None:
                    cls._instance = super().__new__(cls)
                    cls._instance._bundle = None
                    cls._instance._load_lock = threading.Lock()
        return cls._instance

    # seleção de device

    @staticmethod
    def _select_device(device_override: Optional[str]) -> torch.device:
        
        if device_override:
            return torch.device(device_override)

        if torch.cuda.is_available():
            return torch.device("cuda")

        if getattr(torch.backends, "mps", None) is not None and torch.backends.mps.is_available():
            return torch.device("mps")

        return torch.device("cpu")

    # carregamento 

    def load(
        self,
        model_name: str = DEFAULT_MODEL_NAME,
        pretrained: str = DEFAULT_PRETRAINED,
        device: Optional[str] = DEFAULT_DEVICE,
        force_reload: bool = False,
    ) -> CLIPBundle:
        
        if self._bundle is not None and not force_reload:
            return self._bundle

        with self._load_lock:
            # Checagem dupla
            if self._bundle is not None and not force_reload:
                return self._bundle

            selected_device = self._select_device(device)

            logger.info(
                "Carregando modelo OpenCLIP '%s' (pretrained='%s') no device '%s'...",
                model_name,
                pretrained,
                selected_device,
            )

            try:
                model, _, preprocess = open_clip.create_model_and_transforms(
                    model_name,
                    pretrained=pretrained,
                    device=selected_device,
                )
                tokenizer = open_clip.get_tokenizer(model_name)
            except Exception as exc:
                logger.exception(
                    "Falha ao carregar o modelo OpenCLIP '%s' (pretrained='%s').",
                    model_name,
                    pretrained,
                )
                raise RuntimeError(
                    f"Não foi possível carregar o modelo OpenCLIP "
                    f"'{model_name}' com pesos '{pretrained}'."
                ) from exc

            if CLIP_FINETUNED_CHECKPOINT:
                logger.info(
                    "Carregando checkpoint fine-tuned de '%s' por cima dos "
                    "pesos pré-treinados...",
                    CLIP_FINETUNED_CHECKPOINT,
                )
                try:
                    state_dict = torch.load(CLIP_FINETUNED_CHECKPOINT, map_location=selected_device)
                    model.load_state_dict(state_dict)
                except Exception as exc:
                    logger.exception(
                        "Falha ao carregar o checkpoint fine-tuned '%s'.",
                        CLIP_FINETUNED_CHECKPOINT,
                    )
                    raise RuntimeError(
                        f"Não foi possível carregar o checkpoint fine-tuned "
                        f"'{CLIP_FINETUNED_CHECKPOINT}'. Verifique se o "
                        f"arquivo existe e se foi salvo pela mesma arquitetura "
                        f"('{model_name}')."
                    ) from exc

            # Modo de avaliação:desativa dropout/batchnorm em modo de treino, evita resultados não determinísticos ao gerar embeddings.
            model.eval()

            effective_pretrained = pretrained
            if CLIP_FINETUNED_CHECKPOINT:
                checkpoint_name = os.path.basename(CLIP_FINETUNED_CHECKPOINT)
                effective_pretrained = f"{pretrained}+finetuned:{checkpoint_name}"

            self._bundle = CLIPBundle(
                model=model,
                preprocess=preprocess,
                tokenizer=tokenizer,
                device=selected_device,
                model_name=model_name,
                pretrained=effective_pretrained,
            )

            logger.info("Modelo OpenCLIP carregado com sucesso em '%s'.", selected_device)

            return self._bundle

    @property
    def is_loaded(self) -> bool:
        return self._bundle is not None


# API pública do módulo
_loader = _CLIPModelLoader()


def get_clip_bundle(
    model_name: str = DEFAULT_MODEL_NAME,
    pretrained: str = DEFAULT_PRETRAINED,
    device: Optional[str] = DEFAULT_DEVICE,
    force_reload: bool = False,
) -> CLIPBundle:
    """Retorna o CLIPBundle completo (model, preprocess, tokenizer, device)."""
    return _loader.load(
        model_name=model_name,
        pretrained=pretrained,
        device=device,
        force_reload=force_reload,
    )


def get_model() -> torch.nn.Module:
    """Atalho para obter apenas o modelo OpenCLIP já carregado."""
    return get_clip_bundle().model


def get_preprocess() -> Callable:
    """Atalho para obter apenas a função de preprocessamento de imagens."""
    return get_clip_bundle().preprocess


def get_tokenizer() -> Callable:
    """Atalho para obter apenas o tokenizer de texto do OpenCLIP."""
    return get_clip_bundle().tokenizer


def get_device() -> torch.device:
    """Atalho para obter apenas o device onde o modelo está carregado."""
    return get_clip_bundle().device


def is_model_loaded() -> bool:
    """Indica se o modelo já foi carregado em memória."""
    return _loader.is_loaded



# Execução direta: smoke test manual 
if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)

    bundle = get_clip_bundle()
    print(bundle)
    print("Modelo carregado?", is_model_loaded())
