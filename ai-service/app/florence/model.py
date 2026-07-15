#Responsável pelo carregamento do modelo Florence-2.

#Segue o mesmo padrão de `ai/clip/model.py`: singleton thread-safe,
#carregado uma única vez, com seleção automática de device e
#configuração centralizada via variáveis de ambiente.

#Este módulo NÃO gera legendas (isso é `caption.py`) e NÃO detecta
#objetos (isso será `detector.py`).


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
# ---------------------------------------------------------------------------
DEFAULT_MODEL_NAME = os.getenv("FLORENCE_MODEL_NAME", "microsoft/Florence-2-base")
DEFAULT_DEVICE = os.getenv("FLORENCE_DEVICE")  # None => seleção automática

# Algumas versões da biblioteca `transformers` têm incompatibilidade entre
# o código customizado do Florence-2 e a implementação de atenção "sdpa".
# "eager" é a opção mais compatível, ainda que um pouco mais lenta.
DEFAULT_ATTN_IMPLEMENTATION = os.getenv("FLORENCE_ATTN_IMPLEMENTATION", "eager")


@dataclass(frozen=True)
class FlorenceBundle:
    """Agrupa o modelo Florence-2, o processor, o device e o dtype usados."""

    model: Any  # AutoModelForCausalLM (tipo dinâmico, definido pelo trust_remote_code)
    processor: Any  # AutoProcessor
    device: torch.device
    dtype: torch.dtype
    model_name: str

    def __repr__(self) -> str:  # pragma: no cover - cosmético
        return (
            f"FlorenceBundle(model_name={self.model_name!r}, "
            f"device={self.device}, dtype={self.dtype})"
        )


class _FlorenceModelLoader:
    """
    Singleton thread-safe responsável por carregar o Florence-2 apenas
    uma vez durante o ciclo de vida do processo — mesma lógica de
    `_CLIPModelLoader` em `ai/clip/model.py`.
    """

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
        # float16 reduz uso de memória e acelera bastante em GPU. Em CPU
        # mantemos float32, já que float16 não tem suporte otimizado para
        # a maioria das operações fora de GPU.
        return torch.float16 if device.type == "cuda" else torch.float32

    def load(
        self,
        model_name: str = DEFAULT_MODEL_NAME,
        device: Optional[str] = DEFAULT_DEVICE,
        attn_implementation: str = DEFAULT_ATTN_IMPLEMENTATION,
        force_reload: bool = False,
    ) -> FlorenceBundle:
        """
        Carrega o Florence-2 caso ainda não tenha sido carregado.
        Chamadas subsequentes retornam o bundle em cache.

        Parâmetros:
            model_name: checkpoint do Florence-2 no Hugging Face
                        (ex.: "microsoft/Florence-2-base",
                        "microsoft/Florence-2-large").
            device: força um device específico. Se None, escolhe
                    automaticamente (CUDA > MPS > CPU).
            attn_implementation: implementação de atenção usada pelo
                    `transformers` ("eager", "sdpa", ...). "eager" é o
                    valor mais compatível com o código customizado do
                    Florence-2.
            force_reload: ignora o cache e recarrega do zero.

        Retorna:
            FlorenceBundle contendo model, processor, device e dtype.
        """
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
                # trust_remote_code=True é necessário: o Florence-2 usa
                # código de modelagem customizado, publicado pela própria
                # Microsoft junto com os pesos no Hugging Face. Só use
                # este parâmetro com fontes confiáveis, como é o caso aqui.
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
# ---------------------------------------------------------------------------
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


# Execução direta: smoke test manual (python -m src.ai.florence.model)
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)

    bundle = get_florence_bundle()
    print(bundle)
    print("Modelo carregado?", is_model_loaded())

