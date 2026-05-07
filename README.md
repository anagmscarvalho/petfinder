<p align="center">
  <img src="docs/images/logo-placeholder.png" alt="PetFinder Logo" width="120" />
</p>

<h1 align="center">🐾 PetFinder</h1>

<p align="center">
  <strong>Reconhecimento de cães e gatos perdidos usando Inteligência Artificial</strong><br>
  Conectando quem perdeu e quem encontrou um pet através de similaridade visual com CLIP.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-Vite-61DAFB?logo=react&logoColor=white" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?logo=tailwind-css&logoColor=white" />
  <img src="https://img.shields.io/badge/Node.js-Express-339933?logo=node.js&logoColor=white" />
  <img src="https://img.shields.io/badge/Supabase-3ECF8E?logo=supabase&logoColor=white" />
  <img src="https://img.shields.io/badge/Python-FastAPI-009688?logo=fastapi&logoColor=white" />
  <img src="https://img.shields.io/badge/OpenAI-CLIP-412991?logo=openai&logoColor=white" />
</p>

---

## 📋 Sobre o Projeto

O **PetFinder** é uma plataforma web que utiliza inteligência artificial para ajudar a reencontrar pets perdidos. O dono cadastra fotos e dados do animal, e quando alguém encontra um pet, basta enviar uma foto para o sistema comparar automaticamente e retornar a porcentagem de similaridade com os animais cadastrados.

**Equipe:** 4 pessoas · **Prazo:** 2 meses (8 semanas)

---

## 🛠️ Stack Tecnológica

| Camada | Tecnologias |
|--------|-------------|
| **Frontend** | React (Vite), Tailwind CSS |
| **Backend** | Node.js + Express |
| **Banco de Dados & Storage** | Supabase (PostgreSQL + Storage de imagens) |
| **Serviço de IA** | Python + FastAPI, CLIP (OpenAI), sentence-transformers |

---

## 🔄 Fluxo do Sistema

```
┌─────────────────┐    ┌─────────────┐    ┌──────────────────┐
│  Quem perdeu    │    │  Supabase   │    │  CLIP extrai     │
│  sobe fotos +   │ ──▶│  salva tudo │ ──▶│  embedding da    │
│  dados do pet   │    │             │    │  imagem          │
└─────────────────┘    └─────────────┘    └──────────────────┘
                                                   │
                                                   ▼
┌─────────────────┐    ┌─────────────┐    ┌──────────────────┐
│  Retorna % de   │    │  Compara    │    │  Quem achou      │
│  similaridade   │ ◀──│  vetores +  │ ◀──│  sobe foto       │
│                 │    │  texto      │    │                  │
└─────────────────┘    └─────────────┘    └──────────────────┘
```

---

## 📁 Estrutura do Projeto

```
petfinder/
├── frontend/                   # Aplicação React (Vite + Tailwind)
│   ├── public/
│   ├── src/
│   │   ├── assets/             # Imagens, ícones
│   │   ├── components/         # Componentes reutilizáveis
│   │   ├── pages/              # Páginas da aplicação
│   │   │   ├── Home.jsx
│   │   │   ├── ReportLost.jsx  # Tela "Perdi meu pet"
│   │   │   ├── ReportFound.jsx # Tela "Achei um animal"
│   │   │   └── Results.jsx     # Resultados de similaridade
│   │   ├── services/           # Chamadas à API
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── tailwind.config.js
│
├── backend/                    # API REST em Node.js + Express
│   ├── src/
│   │   ├── controllers/        # Lógica dos endpoints
│   │   ├── routes/             # Definição de rotas
│   │   ├── middlewares/        # Middlewares (upload, auth, etc.)
│   │   ├── services/           # Integração com Supabase e IA
│   │   ├── config/             # Configurações (Supabase, env)
│   │   └── app.js
│   ├── package.json
│   └── .env.example
│
├── ai-service/                 # Serviço de IA em Python + FastAPI
│   ├── app/
│   │   ├── main.py             # Servidor FastAPI
│   │   ├── clip_model.py       # Carregamento e uso do CLIP
│   │   ├── similarity.py       # Cosine similarity + score combinado
│   │   └── schemas.py          # Schemas Pydantic
│   ├── requirements.txt
│   └── Dockerfile
│
├── docs/                       # Documentação e imagens
│   └── images/
│
├── docker-compose.yml          # Orquestração dos serviços
├── .gitignore
├── .env.example
└── README.md
```

---

## 👥 Divisão de Tarefas

### Pessoa 1 — Frontend
> **Tecnologias:** React · Tailwind · UX

- Telas de quem perdeu o animal (formulário + upload de fotos)
- Tela de quem encontrou (upload + exibição de resultados)
- Listagem de animais perdidos com filtros (raça, cor, tamanho)
- Barra de progresso / porcentagem de compatibilidade
- Responsividade mobile

### Pessoa 2 — Backend
> **Tecnologias:** Node.js · Express · Supabase

- API REST: endpoints de cadastro e busca de animais
- Configurar Supabase (tabelas, storage de imagens)
- Endpoint que recebe imagem do achado e chama o serviço de IA
- Retornar lista de matches com % de similaridade
- Documentar API (README ou Postman)

### Pessoa 3 — IA / Similaridade
> **Tecnologias:** Python · FastAPI · CLIP

- Configurar servidor Python com FastAPI
- Usar modelo CLIP para gerar embeddings de imagens
- Comparar embeddings (cosine similarity) entre imagens
- Combinar score de imagem + texto (raça, cor, porte)
- Expor endpoint `/compare` para o backend consumir

### Pessoa 4 — DevOps / Docs
> **Tecnologias:** GitHub · Docker · README

- Criar repositório GitHub com estrutura de pastas
- Configurar docker-compose para rodar tudo local
- Escrever README completo com prints e instruções
- Deploy do frontend no Vercel/Netlify (gratuito)
- Ajudar qualquer pessoa do grupo com dificuldades

---

## 📅 Cronograma — 8 Semanas

| Semana | Atividades |
|--------|-----------|
| **Sem 1** | Todos: setup do repositório, estudar cada tecnologia, definir estrutura de pastas |
| **Sem 2** | P1: wireframe das telas · P2: banco Supabase · P3: rodar CLIP localmente · P4: docker-compose base |
| **Sem 3** | P1: tela "perdi meu pet" · P2: endpoints CRUD · P3: endpoint /compare funcional · P4: CI/CD no GitHub |
| **Sem 4** | P1: tela "achei um animal" · P2: integrar backend ↔ IA · P3: ajustar pesos texto+imagem · P4: README v1 |
| **Sem 5** | Integração geral: frontend ↔ backend ↔ IA · Testes manuais com fotos reais de pets |
| **Sem 6** | Correção de bugs · Melhorar UX (loading, erros, mobile) · P4: ajustar docker |
| **Sem 7** | Deploy final (Vercel + Render/Railway para backend) · Testes de usuário · Prints para README |
| **Sem 8** | Polimento visual · README finalizado · Gravação de demo (vídeo curto) · Publicação no GitHub |

---

## 🚀 Como Rodar Localmente

### Pré-requisitos

- [Node.js](https://nodejs.org/) v18+
- [Python](https://www.python.org/) 3.10+
- [Docker](https://www.docker.com/) e Docker Compose
- Conta no [Supabase](https://supabase.com/) (plano gratuito)

### Com Docker (recomendado)

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/petfinder.git
cd petfinder

# Configure as variáveis de ambiente
cp .env.example .env
# Edite o .env com suas credenciais do Supabase

# Suba todos os serviços
docker-compose up --build
```

### Sem Docker

```bash
# Frontend
cd frontend
npm install
npm run dev

# Backend (em outro terminal)
cd backend
npm install
npm run dev

# Serviço de IA (em outro terminal)
cd ai-service
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

---

## 📚 Fontes de Pesquisa

| Área | Links |
|------|-------|
| **React + Vite** | [react.dev/learn](https://react.dev/learn) · [vitejs.dev/guide](https://vitejs.dev/guide) · [tailwindcss.com/docs](https://tailwindcss.com/docs) |
| **Node.js + Supabase** | [supabase.com/docs](https://supabase.com/docs) · [expressjs.com/en/starter](https://expressjs.com/en/starter) · [nodejs.org/en/learn](https://nodejs.org/en/learn) |
| **CLIP + FastAPI** | [github.com/openai/CLIP](https://github.com/openai/CLIP) · [fastapi.tiangolo.com](https://fastapi.tiangolo.com) · [huggingface.co/sentence-transformers](https://huggingface.co/sentence-transformers) |
| **Docker + GitHub** | [docs.docker.com/get-started](https://docs.docker.com/get-started) · [docs.github.com/en/actions](https://docs.github.com/en/actions) · [vercel.com/docs](https://vercel.com/docs) |
| **Similaridade de imagens** | [pinecone.io/learn/image-similarity](https://www.pinecone.io/learn/image-similarity) · [towardsdatascience.com (CLIP search)](https://towardsdatascience.com/clip-image-search) |
| **Projetos similares** | [github.com/topics/lost-pets](https://github.com/topics/lost-pets) · [github.com/topics/image-similarity](https://github.com/topics/image-similarity) |

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.