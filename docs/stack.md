# Stack

O que roda em cada parte do DotWizer, com as versões instaladas em 13/11/2026 (`package-lock.json`). As versões mudam com o lock; confira nele antes de atualizar uma dependência.

## Visão geral

| Parte | Pasta | O que é | Onde roda |
|---|---|---|---|
| App | `apps/mobile` | Expo (React Native), com versão web | Web na Vercel; iPhone e Android ainda sem build de loja |
| API | `apps/api` | Fastify, Prisma e Postgres | Render, plano grátis |
| Servidor do jogo | `apps/game` | Colyseus, com Express | Render, plano grátis |
| Regras do jogo | `packages/rules` | TypeScript puro, sem dependências | Dentro do app, da API e do jogo |
| Protocolo do jogo | `packages/protocol` | Estado da sala (`@colyseus/schema`) e opções validadas com zod | App e jogo |
| Contrato da API | `packages/api-contract` | Schemas zod de cada rota, que também geram o OpenAPI | App, API e jogo |

O repositório é um monorepo com workspaces do npm (`package.json` da raiz). TypeScript em todo lugar, com Node 22 no Render e no CI (`engines`: Node 22.18 ou mais).

## App (`apps/mobile`)

| Item | Versão | Para quê |
|---|---|---|
| Expo SDK | 58.0 | Base do app, build e módulos nativos |
| React Native | 0.88.0 | Interface nativa |
| React | 19.3.0 | Componentes |
| react-native-web | 0.21 | Versão web, a que está publicada |
| Expo Router | 58.0 | Rotas por arquivo em `src/app`, com rotas tipadas |
| TanStack Query | 5.105 | Chamadas à API e cache |
| Reanimated | 4.7.1 | Animações, inclusive as CSS da abertura e das telas |
| Colyseus SDK | 0.18 | Conexão com o servidor do jogo |
| Supabase JS | 2.118 | Login por código, senha e Google |
| AsyncStorage | 2.2.0 | Preferências no aparelho (cartas, feltro, lugar na mesa) |
| expo-secure-store | 58.0 | Sessão do Supabase guardada cifrada no celular |
| expo-notifications | 58.1 | Permissão de notificações |
| expo-clipboard | 58.0 | Copiar o Pix Copia e Cola |
| expo-image, expo-image-picker | 58.0 | Fotos e cartas; foto do perfil |
| Fontes | Onest e Unbounded | `@expo-google-fonts` |

Motor JavaScript no celular: Hermes. A web é exportada em página única (`web.output: "single"`) e servida pela Vercel ([`vercel.json`](../apps/mobile/vercel.json)).

## API (`apps/api`)

| Item | Versão | Para quê |
|---|---|---|
| Fastify | 5.12 | Servidor HTTP |
| `@fastify/type-provider-zod` | 1.0 | Validação das rotas com os schemas do contrato |
| zod | 4.6 | Schemas (`packages/api-contract`) |
| Prisma | 7.10 | Banco e migrações (`prisma/migrations`), com `@prisma/adapter-pg` |
| `@fastify/swagger` | 9.9 | Documento OpenAPI |
| `@fastify/cors`, `@fastify/rate-limit` | 11 | Origens permitidas e limite de chamadas |
| jose | 6.2 | Conferência do token do Supabase |
| Supabase JS | 2.118 | Armazenamento das fotos |
| qrcode | 1.5 | QR Code do Pix simulado |

Testes com mocha, contra um Postgres local no Docker (`apps/api/docker-compose.yml`, porta 54329) e, no CI, contra o Postgres do GitHub Actions.

## Servidor do jogo (`apps/game`)

| Item | Versão | Para quê |
|---|---|---|
| Colyseus | 0.18 | Salas de jogo em tempo real |
| `@colyseus/schema` | 5.0 | Estado da sala sincronizado com o app |
| Express | 5.2 | Rotas HTTP do jogo, como `GET /tables` |
| zod | 3.25 | Validação das opções de entrada (`packages/protocol`) |

O jogo chama a API pelas rotas `/internal`, com o `SERVICE_TOKEN`. Testes com `@colyseus/testing` e mocha.

## Serviços externos

| Serviço | Para quê | Configuração |
|---|---|---|
| Supabase | Login (Auth), banco Postgres e fotos (Storage) | Painel do Supabase; o Render usa o pooler em modo sessão, porque só sai por IPv4 |
| Render | API e servidor do jogo, no plano grátis (dormem sem uso) | [`render.yaml`](../render.yaml); deploy a cada push na `main` com o CI verde |
| Vercel | App web | [`apps/mobile/vercel.json`](../apps/mobile/vercel.json); deploy a cada push na `main` |
| GitHub Actions | CI: typecheck, lint, testes e builds | [`.github/workflows/ci.yml`](../.github/workflows/ci.yml); roda na `main` e em pull requests |
| ViaCEP | Endereço a partir do CEP no perfil | Chamado direto pelo app |

O passo a passo do deploy está em [deploy](deploy.md).

## Qualidade

- **Lint:** ESLint 9 com `typescript-eslint`, e `eslint-config-expo` no app. A configuração da raiz proíbe comentários no código; a do app proíbe que uma feature importe outra.
- **Typecheck:** TypeScript 5.9 na API e no jogo, e 6.0 no app e nos pacotes.
- **Bundle:** `npm run check:bundle --workspace @pontinho/mobile` confere que nenhum código de servidor entra no app.
