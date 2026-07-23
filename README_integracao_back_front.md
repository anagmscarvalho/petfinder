<p align="center">
  <img src="frontend/assets/logo.png" alt="PetFinder Logo" width="120" />
</p>

<h1 align="center">🐾 PetFinder - Branch: `integracao-back-front`</h1>

<p align="center">
  <strong>Registro das implementações, funções e ferramentas utilizadas na integração final do projeto.</strong>
</p>

---

## 🎯 Objetivo desta Branch

Esta branch (`integracao-back-front`) consolida a versão funcional e integrada de ponta a ponta do aplicativo PetFinder. Aqui, os serviços independentes foram conectados: o aplicativo mobile agora consome os dados reais do **Backend Principal**, que por sua vez se comunica com o **Serviço de Inteligência Artificial** para gerar os matches visuais.

---

## 🛠️ Ferramentas Utilizadas

Nesta fase de integração, o ecossistema completo do projeto foi estruturado utilizando as seguintes tecnologias:

### 1. Frontend (Mobile App)
* **React Native & Expo:** Framework base para desenvolvimento do aplicativo multiplataforma.
* **React Navigation:** Para o roteamento do app (Stack Navigator para fluxos isolados e Bottom Tab Navigator para a interface principal).
* **Fetch API (Configurado via `api.js`):** Para o consumo padronizado das requisições REST ao backend, incluindo upload de imagens (`FormData`).
* **Lucide React Native:** Biblioteca de ícones vetoriais.
* **CSS-in-JS (StyleSheet):** Para a construção de uma interface responsiva, com suporte inicial a *Dark Mode*.

### 2. Backend Principal (API)
* **Python 3 & FastAPI:** Framework de alta performance para a criação da API RESTful.
* **SQLModel & SQLite:** ORM que une SQLAlchemy e Pydantic para o mapeamento relacional e banco de dados local da aplicação.
* **Passlib (Argon2) & PyJWT:** Responsáveis pela criptografia de senhas e geração de tokens de sessão (autenticação segura).
* **Pydantic:** Para a forte validação dos dados de entrada e saída (Schemas).

### 3. Serviço de IA (Motor de Busca Visual)
* **FastAPI:** Servidor dedicado apenas para o processamento de Machine Learning.
* **Hugging Face Transformers:** Utilizado para carregar o modelo **CLIP** (Contrastive Language-Image Pretraining).
* **ChromaDB:** Banco de dados vetorial focado em IA, utilizado para calcular e armazenar a similaridade dos embeddings das fotos.
* **Pillow (PIL):** Para processamento de imagem na API.

---

## 🚀 Funções Implementadas e Integradas

O trabalho nesta branch englobou o desenvolvimento de telas, criação de regras de negócio e a interligação das três camadas arquiteturais. As principais entregas foram:

### 1. Autenticação e Gestão de Sessão
* Fluxo completo de **Login** e **Cadastro** com senhas hasheadas via JWT.
* Contexto global de usuário no Frontend (`useAuth`), permitindo que as abas se comportem de maneira diferente dependendo do tipo da conta (Comum, ONG, Admin).
* Função de "Soft Delete": O usuário pode excluir a conta na aba de perfil, o que inativa seus dados, mas preserva o histórico essencial.

### 2. Motor de Busca de IA Integrado (O "Match")
* **O Fluxo de Pet Perdido:** Ao submeter um formulário, a imagem é enviada ao AI Service para gerar os *embeddings*, que são registrados no ChromaDB (vetor) e no SQLite (metadados).
* **O Fluxo de Pet Encontrado:** O usuário tira/escolhe uma foto de um cachorro na rua. O Frontend envia a imagem, o Backend aciona a IA, a IA extrai os embeddings em tempo real e calcula a *Cosine Similarity* contra o ChromaDB. O usuário recebe na mesma tela a lista com as fotos dos cães mais parecidos.

### 3. Chat Interno (Comunicação Segura)
* Substituição de ferramentas de terceiros por um **Chat Nativo** implementado por *Polling*.
* O Frontend varre a API a cada 3 segundos (`setInterval`) para atualizar a conversa em tempo real.
* Geração automática de **Notificações** para alertar os tutores de novas mensagens.

### 4. Murais e Feed Interativo
* **Aba Home:** Lista global de pets cruzando dados do banco.
* **Aba de Adoção:** Funcionalidade restrita a ONGs validadas.
* **Anúncios Administrativos:** Espaço no topo do Feed reservado para comunicados da equipe.
* **Pull-to-Refresh:** O controle nativo permite ao usuário puxar a tela para recarregar a base.

### 5. Configurações de UX e Perfil
* Telas exclusivas para "Meus Pets" e "Favoritos".
* Interface rica, alertas interativos e navegação contínua entre as listas e detalhes de animais.

---

## 💻 Como rodar o sistema integrado

É mandatório que os três ambientes rodem paralelamente para que o app funcione:

```bash
# 1. Iniciar o Backend Principal
npm run start:backend

# 2. Iniciar o Serviço de IA
cd ai-service
source venv/bin/activate
uvicorn app.main:app --port 8001

# 3. Iniciar o App (React Native)
cd frontend
npm start
```