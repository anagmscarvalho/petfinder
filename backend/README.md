# PetFinder — Backend (API)

Este repositório contém a **API em FastAPI**, responsável por autenticação, cadastro e gestão de pets, feed, favoritos, chat e pela orquestração das chamadas ao serviço de IA.

> A parte de IA (modelo CLIP + ChromaDB) é um serviço separado, mantido por outro integrante. Por isso, somente para testes foi criado o arquivo ia_falsa.py.

---

## Sumário

- [Visão geral](#visão-geral)
- [Arquitetura](#arquitetura)
- [Principais decisões de design](#principais-decisões-de-design)
- [Tecnologias](#tecnologias)
- [Estrutura de pastas](#estrutura-de-pastas)
- [Como rodar (local)](#como-rodar-local)
- [Guia de integração / Docker](#guia-de-integração--docker)
- [Endpoints](#endpoints)
- [Fluxo de busca por IA](#fluxo-de-busca-por-ia)

---

## Visão geral

O fluxo central do app: tutores cadastram **pets perdidos**; quem **encontra** um animal envia uma foto, e a IA compara essa foto com os pets perdidos cadastrados, retornando os mais parecidos para que o achador inicie uma conversa com o tutor. O app também mantém um **feed** de pets para adoção (gerenciado por ONGs aprovadas) e **anúncios** educativos e de campanha postados pela equipe organizadora.

Pets encontrados **não são postados publicamente**, eles apenas alimentam a busca por similaridade.

## Arquitetura

O backend conversa com um **serviço de IA separado** por HTTP. Cada serviço é dono do seu próprio banco:

App (Flutter)
       │  HTTP / JSON
       ▼
  Backend FastAPI  ──────►  SQLite  (dados relacionais: usuários, pets, chat…)
       │  HTTP (foto + pet_id)
       ▼
  Serviço de IA  ──────►  ChromaDB  (embeddings vetoriais do CLIP)

  O `pet_id` é o que une os dois: o backend gera o id no SQLite e o envia à IA, que o usa como chave no ChromaDB. Assim o backend nunca precisa guardar vetores e a IA nunca precisa saber o que é bairro ou tutor.

## Principais decisões de design

- **Separação `model` / `schema` / `service`.** Os modelos SQLModel são as tabelas; os schemas Pydantic definem o que entra e sai da API (nunca expõem o hash da senha); os serviços traduzem um no outro. 
 
- **Autenticação por JWT com senha em hash Argon2** (`pwdlib`). A senha nunca é armazenada em texto puro, e o token secreto fica em variável de ambiente, fora do código.

- **Autorização em três níveis:** qualquer usuário logado ou conta ONG aprovada (`pode_postar_adocao`, só ela publica adoção) ou administrador (`is_admin`, só ele publica anúncios).

- **Exclusão de conta por *soft delete*.** Em vez de apagar o usuário, a linha é anonimizada e desativada. Isso **preserva o histórico de chat** para a outra pessoa da conversa — apagar o usuário deixaria as mensagens órfãs. Mas os pets (posts) são removidos.

- **Dados específicos em tabelas separadas.** Campos que só existem para adoção (vacinas, castração, história, personalidade) vivem em `DadosAdocao`, ligada 1‑para‑1 ao pet. Um pet perdido não tem essa linha, é uma regra estrutural.

- **Bairro como enum controlado.** O filtro do feed só funciona se os nomes de bairro forem iguais; um conjunto  pre-selecionado de Bairros de Belém evitando "São Brás" vs "Sao Bras".

- **Comunicação com a IA isolada em um único arquivo** (`services/ia.py`). O backend nem "sabe" que existe HTTP no meio.

- **Chat por *polling* (REST).** Suficiente para o protótipo inicial.

### CLIP e fotos

O score de similaridade é uma **distância de cosseno** (não uma probabilidade). Por isso o app trata os resultados como "candidatos parecidos" e deixa a decisão final para a pessoa via chat.

## Tecnologias

| Área | Ferramentas |
|------|-------------|
| API | FastAPI, Uvicorn |
| ORM / Banco | SQLModel, SQLite |
| Auth | PyJWT, pwdlib[argon2] |
| Validação | Pydantic, pydantic-settings |
| Imagens | Pillow |
| Cliente HTTP (p/ IA) | httpx |
