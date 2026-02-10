#  GAUFLIX - O Acervo da Tribo

![Project Banner](https://img.shields.io/badge/Status-Em_Desenvolvimento-yellow?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)

> "Feito pela Tribo, para a Tribo."

O **Gauflix** é uma plataforma estilo streaming desenvolvida para organizar, filtrar e eternizar as transmissões de campeonatos de **CS:GO** e **CS2** do streamer **Gaules**.

O projeto resolve o problema de navegar por playlists gigantescas e desorganizadas no YouTube, transformando o conteúdo em um catálogo intuitivo separado por **Ano**, **Campeonato** e **Fases** (Major, IEM, BLAST, etc.).

---

## 🚀 Tecnologias Utilizadas

O projeto foi construído utilizando uma stack moderna, focada em performance e escalabilidade serverless:

-   **Frontend:** [React.js](https://reactjs.org/) + [Vite](https://vitejs.dev/)
-   **Estilização:** [Tailwind CSS](https://tailwindcss.com/)
-   **Backend:** Node.js (Serverless Functions via Vercel)
-   **Banco de Dados:** [Supabase](https://supabase.com/) (PostgreSQL)
-   **Integração:** YouTube Data API v3
-   **Deploy:** Vercel

---

## ⚙️ Arquitetura e Sincronização Automática

O diferencial do projeto é o seu **backend autônomo** (`/api/cron.js`). Ele atua como um robô que varre o canal do YouTube e estrutura os dados automaticamente.

### 1. O Fluxo de Coleta
O sistema conecta na API do YouTube e baixa os vídeos da playlist oficial de VODs.

### 2. Processamento Inteligente (Regex)
Como os títulos no YouTube não seguem um padrão rígido, desenvolvi um algoritmo de **Expressões Regulares (Regex)** para sanear os dados:
-   **Limpeza:** Remove termos como "Gaules", "Ao Vivo", "Siga", "MD3".
-   **Reconhecimento:** Identifica padrões de nomes como "IEM Katowice", "PGL Major", "ESL Pro League".
-   **Extração de Ano:** Se o ano não estiver no título, o sistema busca a data de publicação original do vídeo.
-   **Detecção de Fases:** Classifica automaticamente se o vídeo é uma *Grande Final*, *Semifinal*, *Quartas de Final* ou *Fase de Grupos*.

### 3. O "Filtro de Elite"
Para manter o catálogo limpo, o algoritmo possui um filtro de relevância:
-   Campeonatos incompletos ou vídeos soltos são descartados.
-   Apenas eventos que possuam fases decisivas ou uma quantidade significativa de partidas são salvos no banco de dados.

### 4. Persistência
Os dados tratados são enviados para o **Supabase** via `upsert` (atualiza se existir, cria se for novo), garantindo que não haja duplicidade.

---

## 💻 Como Rodar Localmente

Siga os passos abaixo para clonar e executar o projeto na sua máquina.

### Pré-requisitos
-   Node.js instalado (v18+).
-   Conta no Supabase.
-   Chave de API do Google Cloud (YouTube Data API v3).
-   Basta ir para a pasta do bot, cd netflix-gaules cd bot e rodar node sync.js  para testar o funcionamento da api localmente.

### 1. Clone o repositório
```bash
git clone https://github.com/GbAmorim/Gauflix.git
cd Gauflix
