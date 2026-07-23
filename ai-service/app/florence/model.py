from __future__ import annotations

import logging
import os
import threading
from dataclasses import dataclass
from typing import Any, Optional

import torch
from transformers import AutoModelForCausalLM, AutoProcessor

logger = logging.getLogger(__name__)


# Configuração padrão
DEFAULT_MODEL_NAME = os.getenv("FLORENCE_MODEL_NAME", "microsoft/Florence-2-base")
DEFAULT_DEVICE = os.getenv("FLORENCE_DEVICE")  # None => seleção automática

DEFAULT_ATTN_IMPLEMENTATION = os.getenv("FLORENCE_ATTN_IMPLEMENTATION", "eager")


@dataclass(frozen=True)
class FlorenceBundle:
    """Agrupa o modelo Florence-2, o processor, o device e o dtype usados."""

    model: Any  
    processor: Any  # AutoProcessor
    device: torch.device
    dtype: torch.dtype
    model_name: str

    def __repr__(self) -> str:  
        return (
            f"FlorenceBundle(model_name={self.model_name!r}, "
            f"device={self.device}, dtype={self.dtype})"
        )


class _FlorenceModelLoader:

    _instance: Optional["_FlorenceModelLoader"] = None
    _instance_lock = threading.Lock()

    def __new__(cls) -> "_FlorenceModelLoader":
        if cls._instance is None:
            with cls._instance_lock:
                if cls._instance is None:
                    cls._instance = super().__new__(cls)
                    cls._instance._bundle = None
                    cls._instance._load_lock = threading.Lock()
        return cls._instance

    @staticmethod
    def _select_device(device_override: Optional[str]) -> torch.device:
        if device_override:
            return torch.device(device_override)
        if torch.cuda.is_available():
            return torch.device("cuda")
        if getattr(torch.backends, "mps", None) is not None and torch.backends.mps.is_available():
            return torch.device("mps")
        return torch.device("cpu")

    @staticmethod
    def _select_dtype(device: torch.device) -> torch.dtype:
        return torch.float16 if device.type == "cuda" else torch.float32

    def load(
        self,
        model_name: str = DEFAULT_MODEL_NAME,
        device: Optional[str] = DEFAULT_DEVICE,
        attn_implementation: str = DEFAULT_ATTN_IMPLEMENTATION,
        force_reload: bool = False,
    ) -> FlorenceBundle:
        
        if self._bundle is not None and not force_reload:
            return self._bundle

        with self._load_lock:
            if self._bundle is not None and not force_reload:
                return self._bundle

            selected_device = self._select_device(device)
            dtype = self._select_dtype(selected_device)

            logger.info(
                "Carregando modelo Florence-2 '%s' no device '%s' (dtype=%s)...",
                model_name,
                selected_device,
                dtype,
            )

            try:
                # trust_remote_code=True é necessário p/ Florence-2 
                model = AutoModelForCausalLM.from_pretrained(
                    model_name,
                    torch_dtype=dtype,
                    trust_remote_code=True,
                    attn_implementation=attn_implementation,
                ).to(selected_device)

                processor = AutoProcessor.from_pretrained(
                    model_name,
                    trust_remote_code=True,
                )
            except Exception as exc:
                logger.exception(
                    "Falha ao carregar o modelo Florence-2 '%s'.", model_name
                )
                raise RuntimeError(
                    f"Não foi possível carregar o modelo Florence-2 '{model_name}'. "
                    "Verifique se os pacotes 'transformers', 'einops' e 'timm' "
                    "estão instalados (pip install transformers einops timm)."
                ) from exc

            model.eval()

            self._bundle = FlorenceBundle(
                model=model,
                processor=processor,
                device=selected_device,
                dtype=dtype,
                model_name=model_name,
            )

            logger.info("Modelo Florence-2 carregado com sucesso em '%s'.", selected_device)

            return self._bundle

    @property
    def is_loaded(self) -> bool:
        return self._bundle is not None



# API pública do módulo
_loader = _FlorenceModelLoader()


def get_florence_bundle(
    model_name: str = DEFAULT_MODEL_NAME,
    device: Optional[str] = DEFAULT_DEVICE,
    attn_implementation: str = DEFAULT_ATTN_IMPLEMENTATION,
    force_reload: bool = False,
) -> FlorenceBundle:
    """Retorna o FlorenceBundle completo (model, processor, device, dtype)."""
    return _loader.load(
        model_name=model_name,
        device=device,
        attn_implementation=attn_implementation,
        force_reload=force_reload,
    )


def get_model() -> Any:
    """Atalho para obter apenas o modelo Florence-2 já carregado."""
    return get_florence_bundle().model


def get_processor() -> Any:
    """Atalho para obter apenas o processor (tokenizer + processador de imagem)."""
    return get_florence_bundle().processor


def get_device() -> torch.device:
    """Atalho para obter apenas o device onde o modelo está carregado."""
    return get_florence_bundle().device


def get_dtype() -> torch.dtype:
    """Atalho para obter apenas o dtype usado pelo modelo (float16/float32)."""
    return get_florence_bundle().dtype


def is_model_loaded() -> bool:
    """Indica se o modelo já foi carregado em memória."""
    return _loader.is_loaded



# Execução direta: smoke test manual (python -m app.florence.model)
if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)

    bundle = get_florence_bundle()
    print(bundle)
    print("Modelo carregado?", is_model_loaded())
