<p align="center">
  <img src="frontend/assets/logo.png" alt="PetFinder Logo" width="120" />
</p>

<h1 align="center">🐾 PetFinder</h1>

<p align="center">
  <strong>Reconhecimento de cães perdidos usando Inteligência Artificial</strong><br>
  Conectando quem perdeu e quem encontrou um pet através de similaridade visual com IA.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React_Native-Expo-000020?logo=react&logoColor=61DAFB" />
  <img src="https://img.shields.io/badge/Python-FastAPI-009688?logo=fastapi&logoColor=white" />
  <img src="https://img.shields.io/badge/ChromaDB-Vector_Database-FF6F00?logo=database&logoColor=white" />
  <img src="https://img.shields.io/badge/SQLite-SQLModel-003B57?logo=sqlite&logoColor=white" />
  <img src="https://img.shields.io/badge/OpenAI-CLIP-412991?logo=openai&logoColor=white" />
</p>

---

## 📋 Sobre o Projeto

O **PetFinder** é um aplicativo mobile focado em resolver um problema real: reencontrar cães perdidos. 
Muitas vezes, quem encontra um cachorro na rua não sabe como procurar o dono. Com o PetFinder, basta tirar uma foto do cão encontrado e o aplicativo utilizará Inteligência Artificial (modelo CLIP) para comparar a foto com o banco de dados de pets perdidos na região, retornando os resultados mais similares.

Se houver um "match", o usuário que encontrou pode iniciar um chat com o dono diretamente pelo app para combinar o resgate. Além disso, o aplicativo conta com um mural de adoção para ONGs cadastradas e um mural educativo da equipe organizadora.

---

## 🛠️ Stack Tecnológica

| Camada | Tecnologias |
|--------|-------------|
| **Frontend (Mobile/Web)** | React Native (Expo SDK), React Navigation |
| **Backend Principal (API)** | Python (FastAPI), SQLModel, SQLite, JWT, pwdlib |
| **Serviço de IA** | Python (FastAPI), ChromaDB, modelo CLIP (Hugging Face) |

---

## 🔄 Arquitetura e Fluxo

O sistema foi desenhado em uma arquitetura de microserviços (ou serviços segregados) focada em performance e separação de responsabilidades.

```
┌─────────────────┐    ┌─────────────────┐    ┌──────────────────┐
│  Frontend App   │    │  Backend (8000) │    │  AI Service (8001)│
│  (React Native) │ ──▶│  (FastAPI +     │ ──▶│  (ChromaDB +     │
│                 │ ◀──│   SQLite)       │ ◀──│   Modelo CLIP)   │
└─────────────────┘    └─────────────────┘    └──────────────────┘
```

1. **Cadastro de Pet Perdido:** O usuário cria um alerta. A foto e os dados vão para o Backend Principal (banco relacional). O backend principal se comunica com o Serviço de IA para gerar o *embedding* vetorial (representação matemática da imagem) e armazenar no ChromaDB.
2. **Busca por Pet Encontrado:** Uma pessoa tira uma foto de um cão na rua. A foto é enviada ao backend, que repassa para o AI Service. O CLIP extrai o embedding da foto e faz uma busca de similaridade (Cosine Similarity) no ChromaDB, retornando os IDs dos cães mais parecidos.
3. **Chat Interno:** Ao encontrar um possível match, o usuário inicia uma conversa. O chat funciona por *polling* no backend REST, garantindo que o número do telefone pessoal não seja exposto.

---

## 🚀 Funcionalidades Principais

* **Busca por Similaridade Visual (IA):** Não depende de preencher longos formulários de características; a IA avalia a foto e encontra o cachorro.
* **Mural de Adoção:** Espaço exclusivo para pets que buscam um novo lar (postados por usuários com permissão de adoção/ONGs).
* **Mural Educativo:** Anúncios e campanhas criados pelos administradores.
* **Chat Seguro:** Troca de mensagens em tempo real (via polling) com privacidade, sem expor os contatos pessoais.
* **Gestão de Perfil:** Atualização de foto de perfil (UI), troca de senha, deleção de conta e gerenciamento de favoritos.
* **Modo Escuro (Aparência):** Suporte nativo a Light/Dark theme.

---

## 💻 Como Rodar Localmente

O projeto exige 3 terminais paralelos rodando simultaneamente. 

### 1. Backend Principal
```bash
# Na pasta raiz do projeto:
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Iniciar servidor na porta 8000
npm run start:backend
# (Ou rodar: uvicorn app.main:app --reload --host 0.0.0.0 --port 8000)
```

### 2. Serviço de IA
```bash
cd ai-service
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Iniciar servidor na porta 8001
uvicorn app.main:app --port 8001
```

### 3. Frontend (Aplicativo Mobile/Web)
```bash
cd frontend
npm install

# Iniciar o Expo (Metro Bundler)
npx expo start -c
```
Após rodar o frontend, você pode abrir o app em um emulador, pelo app **Expo Go** no seu celular (se o IP da máquina estiver configurado no `.env`), ou apertar a tecla `w` no terminal para abrir a versão Web no navegador.

---

## 👥 Equipe Desenvolvedora

Este aplicativo foi desenvolvido pelo time:
- **Anna Talyta** (Talyta & Greta)
- **Ana Carolina** (Carol & Susie)
- **Marianna Ferreira** (Mari & Docinho)
- **Miguel Santos** (Miguel & Zara)

## 📄 Licença

Este projeto foi desenvolvido como protótipo acadêmico e está sob a licença MIT.