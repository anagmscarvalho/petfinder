# 📱 PetFinder Frontend — Setup & Requisitos

Guia completo para configurar e rodar o frontend mobile do PetFinder.

---

## 🧰 Pré-requisitos

### Obrigatórios

| Ferramenta | Versão Mínima | Instalação |
|------------|--------------|------------|
| **Node.js** | `>= 20.x` | [nodejs.org](https://nodejs.org/) |
| **npm** | `>= 10.x` | Vem com o Node.js |
| **Expo CLI** | (via npx) | Já incluso — roda com `npx expo` |
| **Expo Go** (app no celular) | Última versão | [Android](https://play.google.com/store/apps/details?id=host.exp.exponent) · [iOS](https://apps.apple.com/app/expo-go/id982107779) |

### Opcionais (para emulador)

| Ferramenta | Uso |
|------------|-----|
| **Android Studio** | Emulador Android (AVD Manager) |
| **Xcode** (macOS only) | Simulador iOS |

> **Nota:** Para começar a desenvolver, basta o celular com Expo Go + computador na mesma rede Wi-Fi. Não precisa de emulador.

---

## ⚡ Instalação Rápida

```bash
# 1. Entrar no diretório do frontend
cd frontend

# 2. Instalar dependências
npm install

# 3. Iniciar o Expo dev server
npx expo start
```

Vai aparecer um QR code no terminal. Escaneie com o app **Expo Go** no celular.

---

## 📦 Dependências do Projeto

### Produção
| Pacote | Versão | Descrição |
|--------|--------|-----------|
| `expo` | ~56.x | Framework mobile (managed workflow) |
| `react` | 19.x | Biblioteca de UI |
| `react-native` | 0.85.x | Framework mobile nativo |
| `expo-status-bar` | ~56.x | Controle da barra de status |
| `expo-image-picker` | ~56.x | Acesso à câmera e galeria de fotos |
| `@react-navigation/native` | ^7.x | Navegação entre telas |
| `@react-navigation/native-stack` | ^7.x | Stack Navigator (transição entre telas) |
| `react-native-screens` | Expo-managed | Performance de navegação (nativo) |
| `react-native-safe-area-context` | Expo-managed | Safe area para notch/ilhas |
| `@supabase/supabase-js` | ^2.x | Client do Supabase (auth, storage, DB) |

### Desenvolvimento
Nenhuma dependência de desenvolvimento adicional. O Expo já inclui Babel, Metro bundler, etc.

---

## 🐳 Serviços Backend (Docker)

O frontend mobile **NÃO roda em Docker**. Ele roda diretamente no celular/emulador.

Os serviços backend rodam via Docker na raiz do projeto:

```bash
# Na raiz do projeto (fora de frontend/)
docker-compose up --build
```

Isso sobe:
- **backend** (Node.js + Express) → `http://localhost:3001`
- **ai-service** (Python + FastAPI + CLIP) → `http://localhost:8000`

### Conectando o app ao backend

O app usa a variável de ambiente `EXPO_PUBLIC_API_URL` para saber onde está o backend.

**No emulador Android:**
```
EXPO_PUBLIC_API_URL=http://10.0.2.2:3001
```

**No celular físico (Expo Go):**
```
EXPO_PUBLIC_API_URL=http://<IP-DA-SUA-MAQUINA>:3001
```

Para descobrir o IP da sua máquina:
```bash
# Linux
hostname -I | awk '{print $1}'

# macOS
ipconfig getifaddr en0
```

Crie um arquivo `.env` na raiz do `frontend/` se quiser persistir:
```bash
# frontend/.env
EXPO_PUBLIC_API_URL=http://192.168.1.100:3001
```

---

## 🗂️ Estrutura de Diretórios

```
frontend/
├── App.js                        # Entry point — configura navegação
├── app.json                      # Configuração Expo (nome, ícone, permissões)
├── package.json                  # Dependências
├── babel.config.js               # Config do Babel (gerado pelo Expo)
├── index.js                      # Registro do app (Expo)
├── SETUP.md                      # Este documento
│
├── assets/                       # Assets do Expo (ícone, splash, etc.)
│
├── src/
│   ├── screens/                  # Telas do app
│   │   ├── HomeScreen.js         # Tela inicial
│   │   ├── ReportLostScreen.js   # "Perdi meu pet"
│   │   ├── ReportFoundScreen.js  # "Achei um animal"
│   │   └── ResultsScreen.js      # Resultados de similaridade
│   │
│   ├── components/               # Componentes reutilizáveis (botões, cards, etc.)
│   │
│   ├── navigation/               # Configuração de rotas
│   │   └── AppNavigator.js       # Stack Navigator principal
│   │
│   ├── services/                 # Chamadas à API
│   │   └── api.js                # Fetch wrapper + upload de imagens
│   │
│   ├── assets/                   # Imagens, fontes e ícones do app
│   │
│   └── constants/                # Cores, dimensões, configs
```

---

## 📋 Comandos Úteis

| Comando | Descrição |
|---------|-----------|
| `npx expo start` | Iniciar dev server (QR code) |
| `npx expo start --android` | Abrir direto no emulador Android |
| `npx expo start --ios` | Abrir direto no simulador iOS |
| `npx expo start --web` | Abrir no navegador (debug rápido) |
| `npx expo start --clear` | Limpar cache do Metro bundler |
| `npx expo install <pacote>` | Instalar pacote com versão compatível |
| `npx expo doctor` | Verificar problemas de compatibilidade |

---

## 🔧 Troubleshooting

### "Network request failed" no Expo Go
- Verifique se o celular e o computador estão na mesma rede Wi-Fi
- Verifique se o `EXPO_PUBLIC_API_URL` está apontando pro IP correto da máquina
- Verifique se o firewall não está bloqueando a porta do backend

### App não carrega no Expo Go
- Tente `npx expo start --clear` para limpar o cache
- Atualize o Expo Go para a última versão
- Verifique se o Node.js é >= 20

### Erro de permissão (câmera/galeria)
- No Android: as permissões são pedidas automaticamente pelo `expo-image-picker`
- No iOS: as mensagens de permissão estão configuradas no `app.json`

---

## 🔗 Links Úteis

| Recurso | Link |
|---------|------|
| Documentação Expo | [docs.expo.dev](https://docs.expo.dev/) |
| React Native | [reactnative.dev](https://reactnative.dev/) |
| React Navigation | [reactnavigation.org](https://reactnavigation.org/) |
| Expo Image Picker | [docs.expo.dev/versions/latest/sdk/imagepicker](https://docs.expo.dev/versions/latest/sdk/imagepicker/) |
| Supabase JS Client | [supabase.com/docs/reference/javascript](https://supabase.com/docs/reference/javascript/) |
