"""
Testes de integração para o ai-service do PetFinder.

Valida que os endpoints /health, /embeddings, /compare e /embeddings/{pet_id} DELETE
funcionam corretamente com o FastAPI TestClient.

NOTA: Estes testes carregam os modelos reais (CLIP + Florence-2) e portanto são
lentos na primeira execução (~30-60s para download dos modelos). Execuções
subsequentes usam cache e são mais rápidas (~5-15s por teste).
"""

from __future__ import annotations

import io
import os
import shutil
import tempfile

import pytest
from fastapi.testclient import TestClient
from PIL import Image

# Usar diretório temporário para ChromaDB nos testes
_TEST_CHROMA_DIR = tempfile.mkdtemp(prefix="petfinder_test_chroma_")
os.environ["CHROMA_PERSIST_DIR"] = _TEST_CHROMA_DIR
os.environ["CHROMA_COLLECTION_NAME"] = "test_pet_embeddings"

from app.main import app  # noqa: E402  — import depois de setar env vars


@pytest.fixture(scope="module")
def client():
    """TestClient compartilhado por todos os testes do módulo."""
    with TestClient(app) as c:
        yield c


@pytest.fixture(scope="module", autouse=True)
def cleanup_chroma():
    """Remove o diretório temporário do ChromaDB após os testes."""
    yield
    shutil.rmtree(_TEST_CHROMA_DIR, ignore_errors=True)


def _create_test_image(color: str = "brown", size: tuple = (256, 256)) -> bytes:
    """Cria uma imagem de teste simples (quadrado colorido) em memória."""
    color_map = {
        "brown": (139, 69, 19),
        "black": (10, 10, 10),
        "white": (245, 245, 245),
        "golden": (218, 165, 32),
    }
    rgb = color_map.get(color, (128, 128, 128))
    img = Image.new("RGB", size, rgb)
    buf = io.BytesIO()
    img.save(buf, format="JPEG", quality=85)
    buf.seek(0)
    return buf.read()


def _create_invalid_file() -> bytes:
    """Cria um arquivo que NÃO é uma imagem válida."""
    return b"Este nao e um arquivo de imagem valido. Lorem ipsum dolor sit amet."


# ─── Testes ────────────────────────────────────────────────────────────────────


class TestHealthcheck:
    """Testa o endpoint /health."""

    def test_health_returns_ok(self, client: TestClient):
        response = client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ok"


class TestEmbeddings:
    """Testa o endpoint POST /embeddings (gravar embedding de um pet)."""

    def test_gravar_embedding_sucesso(self, client: TestClient):
        """Deve indexar uma foto e retornar ok=true."""
        image_bytes = _create_test_image("brown")

        response = client.post(
            "/embeddings",
            data={"pet_id": "1"},
            files={"photo": ("dog_brown.jpg", image_bytes, "image/jpeg")},
        )

        assert response.status_code == 200, f"Resposta: {response.text}"
        data = response.json()
        assert data["ok"] is True

    def test_gravar_segundo_embedding(self, client: TestClient):
        """Deve indexar um segundo pet sem erro."""
        image_bytes = _create_test_image("black")

        response = client.post(
            "/embeddings",
            data={"pet_id": "2"},
            files={"photo": ("dog_black.jpg", image_bytes, "image/jpeg")},
        )

        assert response.status_code == 200
        assert response.json()["ok"] is True

    def test_gravar_terceiro_embedding(self, client: TestClient):
        """Indexa um terceiro pet (golden) para ter 3 no banco."""
        image_bytes = _create_test_image("golden")

        response = client.post(
            "/embeddings",
            data={"pet_id": "3"},
            files={"photo": ("dog_golden.jpg", image_bytes, "image/jpeg")},
        )

        assert response.status_code == 200
        assert response.json()["ok"] is True


class TestCompare:
    """Testa o endpoint POST /compare (buscar pets similares)."""

    def test_compare_retorna_matches(self, client: TestClient):
        """Deve retornar uma lista de matches com pet_id e score."""
        # Usa a mesma imagem "brown" que foi indexada como pet_id=1
        query_image = _create_test_image("brown")

        response = client.post(
            "/compare",
            files={"photo": ("query.jpg", query_image, "image/jpeg")},
        )

        assert response.status_code == 200, f"Resposta: {response.text}"
        data = response.json()

        assert "matches" in data
        assert isinstance(data["matches"], list)

        if len(data["matches"]) > 0:
            match = data["matches"][0]
            assert "pet_id" in match
            assert "score" in match
            assert "similarity_percentage" in match
            # O melhor match deve ter um score razoável
            assert match["score"] > 0, f"Score inesperado: {match['score']}"

    def test_compare_imagem_similar_tem_score_alto(self, client: TestClient):
        """Uma imagem idêntica à indexada deve retornar score alto."""
        # Imagem idêntica à indexada como pet_id=1
        identical_image = _create_test_image("brown")

        response = client.post(
            "/compare",
            files={"photo": ("identical.jpg", identical_image, "image/jpeg")},
        )

        assert response.status_code == 200
        data = response.json()
        matches = data["matches"]

        assert len(matches) > 0, "Deveria ter pelo menos 1 match"

        # O primeiro match (mais similar) deve ser o pet_id=1 com score alto
        best_match = matches[0]
        assert best_match["score"] > 0.8, (
            f"Score do melhor match deveria ser > 0.8, mas foi {best_match['score']}"
        )


class TestDeleteEmbedding:
    """Testa o endpoint DELETE /embeddings/{pet_id}."""

    def test_deletar_embedding_existente(self, client: TestClient):
        """Deve remover o embedding sem erro."""
        response = client.delete("/embeddings/2")

        assert response.status_code == 200
        data = response.json()
        assert data["ok"] is True

    def test_deletar_embedding_inexistente(self, client: TestClient):
        """Deletar um pet que não existe deve retornar ok (idempotente)."""
        response = client.delete("/embeddings/99999")

        assert response.status_code == 200
        data = response.json()
        assert data["ok"] is True

    def test_compare_apos_delete_nao_retorna_pet_removido(self, client: TestClient):
        """Após deletar pet_id=2, ele não deve aparecer nos matches."""
        query_image = _create_test_image("black")

        response = client.post(
            "/compare",
            files={"photo": ("query_after_delete.jpg", query_image, "image/jpeg")},
        )

        assert response.status_code == 200
        data = response.json()
        match_ids = [m["pet_id"] for m in data["matches"]]
        assert 2 not in match_ids, (
            f"Pet 2 deveria ter sido removido, mas apareceu nos matches: {match_ids}"
        )


class TestErros:
    """Testa cenários de erro."""

    def test_compare_com_arquivo_invalido(self, client: TestClient):
        """Enviar um arquivo que não é imagem deve retornar erro 500."""
        invalid_data = _create_invalid_file()

        response = client.post(
            "/compare",
            files={"photo": ("not_an_image.txt", invalid_data, "text/plain")},
        )

        # O serviço deve retornar um erro (500) ao tentar processar algo que não é imagem
        assert response.status_code == 500

    def test_embeddings_sem_photo(self, client: TestClient):
        """Enviar request sem o campo photo deve retornar 422."""
        response = client.post(
            "/embeddings",
            data={"pet_id": "99"},
        )

        assert response.status_code == 422

    def test_embeddings_sem_pet_id(self, client: TestClient):
        """Enviar request sem pet_id deve retornar 422."""
        image_bytes = _create_test_image()

        response = client.post(
            "/embeddings",
            files={"photo": ("test.jpg", image_bytes, "image/jpeg")},
        )

        assert response.status_code == 422
