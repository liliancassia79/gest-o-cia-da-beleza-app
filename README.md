# Gestão Cia da Beleza

Este é o projeto do aplicativo web **Gestão Cia da Beleza**, um painel administrativo para controle de agendamentos e gestão do salão.

## 🚀 Tecnologias Utilizadas

O projeto foi construído utilizando as ferramentas mais modernas do ecossistema web:

- **[React](https://react.dev/)**: Biblioteca para criação de interfaces de usuário.
- **[Vite](https://vitejs.dev/)**: Ferramenta de construção e empacotamento ultrarrápida.
- **[TanStack Router / Start](https://tanstack.com/router/latest)**: Roteamento avançado e renderização eficiente.
- **[Tailwind CSS v4](https://tailwindcss.com/)**: Framework CSS utilitário para estilização rápida e responsiva.
- **[Supabase](https://supabase.com/)**: Backend-as-a-Service para banco de dados e autenticação.
- **[Radix UI](https://www.radix-ui.com/) (shadcn/ui)**: Componentes acessíveis e customizáveis.
- **PWA (Progressive Web App)**: Suporte a instalação no celular e funcionamento offline.

## 📦 Como rodar o projeto localmente

Para executar o projeto em sua máquina, siga os passos abaixo. É necessário ter o [Node.js](https://nodejs.org/) instalado.

1. **Clone ou baixe o projeto**
   Abra o terminal e acesse a pasta do projeto:
   ```bash
   cd "Gestão Cia da Beleza app/projeto"
   ```

2. **Instale as dependências**
   Execute o comando abaixo para baixar todos os pacotes necessários:
   ```bash
   npm install
   ```

3. **Inicie o servidor de desenvolvimento**
   Após a instalação, inicie o servidor com:
   ```bash
   npm run dev
   ```

4. **Acesse no navegador**
   O projeto estará rodando localmente, geralmente no endereço: `http://localhost:5173`

## 📱 Suporte a PWA

Este aplicativo foi configurado como um PWA (Progressive Web App), o que significa que ele pode ser "instalado" diretamente na tela inicial de um smartphone ou computador.
- **Manifest**: Define as cores, nome e o ícone do aplicativo.
- **Service Worker**: Responsável por fazer cache dos arquivos principais (`/sw.js`) permitindo carregamento super rápido e suporte a telas quando não houver internet (offline mode).

## 🛠 Comandos Disponíveis

- `npm run dev`: Inicia o servidor local de desenvolvimento.
- `npm run build`: Cria a versão otimizada (build) do projeto para produção.
- `npm run preview`: Permite visualizar a versão de produção gerada localmente.

---
*Desenvolvido para Cia da Beleza*
