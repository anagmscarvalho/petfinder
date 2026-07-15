"""
Responsável pelo carregamento do modelo OpenCLIP.

Este módulo tem a única função de garantir que o modelo, o preprocess, o tokenizer e o device sejam
carregados UMA ÚNICA VEZ e reutilizados por toda a aplicação e jobs em lote.

Uso típico:

    from src.ai.clip.model import get_clip_bundle

    clip = get_clip_bundle()
    clip.model, clip.preprocess, clip.tokenizer, clip.device

Ou, de forma mais direta:

    from src.ai.clip.model import get_model, get_preprocess, get_tokenizer, get_device
"""

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
# Estes valores podem ser sobrescritos por variáveis de ambiente

DEFAULT_MODEL_NAME = os.getenv("CLIP_MODEL_NAME", "ViT-B-32")
DEFAULT_PRETRAINED = os.getenv("CLIP_PRETRAINED", "laion2b_s34b_b79k")
DEFAULT_DEVICE = os.getenv("CLIP_DEVICE")  # None => seleção automática


@dataclass(frozen=True)
class CLIPBundle:
    """
    Agrupa tudo que é necessário para trabalhar com o OpenCLIP:
    o modelo em si, a função de preprocessamento de imagens, o
    tokenizer de texto e o device onde o modelo foi carregado.

    É imutável (frozen) para evitar que algum módulo consumidor
    substitua acidentalmente o modelo em tempo de execução.
    """

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
    """
    Singleton thread-safe responsável por carregar o OpenCLIP apenas
    uma vez durante o ciclo de vida do processo.

    Implementado como singleton (e não como simples variáveis de
    módulo) para permitir, no futuro, múltiplas configurações
    nomeadas (ex.: um modelo maior para o servidor e um menor para
    testes locais) sem reescrever a lógica de carregamento.
    """

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

    # -- seleção de device ---------------------------------------------

    @staticmethod
    def _select_device(device_override: Optional[str]) -> torch.device:
        """
        Escolhe automaticamente o melhor device disponível, a menos
        que um device específico tenha sido informado explicitamente
        (via parâmetro ou variável de ambiente CLIP_DEVICE).

        Ordem de preferência: CUDA > MPS (Apple Silicon) > CPU.
        """
        if device_override:
            return torch.device(device_override)

        if torch.cuda.is_available():
            return torch.device("cuda")

        if getattr(torch.backends, "mps", None) is not None and torch.backends.mps.is_available():
            return torch.device("mps")

        return torch.device("cpu")

    # -- carregamento -----------------------------------------------------

    def load(
        self,
        model_name: str = DEFAULT_MODEL_NAME,
        pretrained: str = DEFAULT_PRETRAINED,
        device: Optional[str] = DEFAULT_DEVICE,
        force_reload: bool = False,
    ) -> CLIPBundle:
        """
        Carrega o modelo OpenCLIP caso ainda não tenha sido carregado.
        Chamadas subsequentes retornam o mesmo objeto em cache,
        independentemente de quem as fez (API, notebook, worker de
        batch), evitando recarregar pesos e duplicar uso de memória.

        Parâmetros:
            model_name: arquitetura do OpenCLIP (ex.: "ViT-B-32").
            pretrained: nome do checkpoint pré-treinado (ex.: "laion2b_s34b_b79k").
            device: força um device específico ("cuda", "cpu", "mps").
                    Se None, o device é escolhido automaticamente.
            force_reload: ignora o cache e recarrega o modelo do zero.
                          Útil em notebooks ao trocar de modelo em tempo
                          de execução.

        Retorna:
            CLIPBundle contendo model, preprocess, tokenizer e device.
        """
        if self._bundle is not None and not force_reload:
            return self._bundle

        with self._load_lock:
            # Checagem dupla: outra thread pode ter carregado o modelo
            # enquanto esperávamos o lock.
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

            # Modo de avaliação: desativa dropout/batchnorm em modo de
            # treino, evitando resultados não determinísticos ao gerar
            # embeddings.
            model.eval()

            self._bundle = CLIPBundle(
                model=model,
                preprocess=preprocess,
                tokenizer=tokenizer,
                device=selected_device,
                model_name=model_name,
                pretrained=pretrained,
            )

            logger.info("Modelo OpenCLIP carregado com sucesso em '%s'.", selected_device)

            return self._bundle

    @property
    def is_loaded(self) -> bool:
        return self._bundle is not None


# API pública do módulo
# São estas as funções que o restante da aplicação (image_embedding.py,
# text_embedding.py, batch_embedding.py, rotas da API,) deve
# importar. Elas escondem o singleton interno e garantem carregamento
# preguiçoso (lazy loading): o modelo só é efetivamente carregado na
# primeira chamada.

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


# Execução direta: smoke test manual (python -m src.ai.clip.model)
if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)

    bundle = get_clip_bundle()
    print(bundle)
    print("Modelo carregado?", is_model_loaded())
