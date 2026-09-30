# Guia de Exportação para o GitHub e Geração do APK Android

Este projeto foi configurado com a arquitetura híbrida oficial do **Capacitor**, permitindo que a aplicação Web e os módulos nativos do Android (como o `NotificationListenerService` para Pix e pagamentos) coexistam em perfeita harmonia.

---

## Opção 1: Geração Automática via GitHub Actions (Recomendada)

Ao exportar este repositório para a sua conta do **GitHub**, o fluxo de CI/CD já está 100% configurado para compilar o APK automaticamente na nuvem:

1. Acesse o seu repositório no GitHub.
2. Clique na aba **Actions** no topo da página.
3. No menu à esquerda, selecione o workflow **Build Android APK**.
4. Clique no botão **Run workflow** (ou simplesmente faça um `push` na branch principal).
5. O GitHub executará a instalação das dependências, build dos assets, sincronização do Capacitor e a compilação do Gradle com Java 21.
6. Ao finalizar a execução, role até a seção **Artifacts** e faça o download do pacote **`budgeting-apk`**. O arquivo `app-debug.apk` já estará pronto para instalação no seu celular Android.

---

## Opção 2: Geração Local no Computador (Android Studio ou Terminal)

Se preferir compilar localmente na sua máquina:

### Pré-requisitos
- **Node.js 18+** e **npm**
- **Java JDK 17 ou 21**
- **Android SDK** (instalado com o Android Studio)

### Passo a passo no Terminal
```bash
# 1. Instalar as dependências do projeto
npm install

# 2. Compilar os assets Web e sincronizar com o projeto Android
npm run build:android

# 3. Acessar a pasta do Android
cd android

# 4. Gerar o APK de depuração (Linux / macOS)
chmod +x gradlew
./gradlew assembleDebug

# No Windows (PowerShell / CMD):
gradlew.bat assembleDebug
```

O arquivo compilado estará disponível em:
`android/app/build/outputs/apk/debug/app-debug.apk`

---

## Abrindo no Android Studio
1. Abra o **Android Studio**.
2. Selecione **Open** e escolha a pasta `/android` deste repositório.
3. Aguarde o Gradle sincronizar as dependências.
4. No menu superior, vá em **Build > Build Bundle(s) / APK(s) > Build APK(s)**.
5. Conecte seu dispositivo Android com a Depuração USB ativada e clique em **Run** (`Shift + F10`) para instalar diretamente.

---

## Permissão de Leitura de Notificações no Celular
Quando o aplicativo for instalado no Android:
1. Abra o app **Budgeting**.
2. Clique no ícone de smartphone no cabeçalho ou vá em **Monitoramento de Notificações**.
3. Toque em **Conceder no Android** para permitir que o app acesse as notificações de transferências e pagamentos das suas contas bancárias.
