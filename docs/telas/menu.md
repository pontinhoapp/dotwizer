# Menu

Primeira tela de quem já tem cadastro. Mostra a foto, o saldo e o bônus diário, e leva para Jogar (mesas online), Treinar (treino com robôs), Pagamento, Perfil, Configurações, Estatísticas, Manual DotWizer e Ajuda.

Código: `apps/mobile/src/app/index.tsx`, com `useWallet`, `useDailyBonus`, `ChipBalance` e `DailyBonus` de `apps/mobile/src/features/wallet/`.

## Chamadas

- `GET /wallet` ao abrir e sempre que a tela volta ao foco.
- `GET /profile` para a foto e o apelido, já em cache pelo guard de login.
- `POST /wallet/daily-bonus` ao tocar em "Resgatar bônus diário". Depois, sucesso ou erro, o app lê a carteira de novo.

## Sucesso

- `GET /wallet` responde 200 com `balance` e `dailyBonusAvailable`. O saldo aparece no topo; o bônus aparece como botão, ou como "já resgatado" quando `dailyBonusAvailable` é falso.
- `POST /wallet/daily-bonus` responde 200 e o saldo novo aparece com a carteira relida.

## Para onde leva

| Item | Vai para |
|---|---|
| Jogar | [jogar online](jogar-online.md) (`/lobby`) |
| Treinar | [ajuste da partida](ajuste-da-partida.md) (`/training`) |
| Pagamento | [pagamentos](pagamentos.md) (`/payments`) |
| Perfil | [perfil](perfil.md) (`/profile`), onde fica o Sair |
| Configurações, Estatísticas, Manual DotWizer e Ajuda | Telas vazias, só com o título (`/settings`, `/stats`, `/manual` e `/help`) |

Com uma sala aberta (`room` do `MatchProvider`), o menu manda direto para a mesa.

## Erros

Os erros que valem para toda rota estão em [erros comuns](erros-comuns.md).

| Código da API | Status | Quando | Tratamento no app | Chave do texto |
|---|---|---|---|---|
| `dailyBonusAlreadyClaimed` | 409 | O bônus de hoje já foi resgatado, por exemplo em outro aparelho. | Nada em vermelho: a carteira relida mostra "já resgatado". | `wallet.dailyBonusClaimed` |

### Falhas sem resposta útil da API

| Falha | Quando | Tratamento no app | Chave do texto |
|---|---|---|---|
| sem conexão na carteira | `GET /wallet` falhou por rede ou tempo. | Saldo "—" e aviso com "Tentar de novo", que lê a carteira de novo. | `errors.unreachable` |
| sem conexão no bônus | `POST /wallet/daily-bonus` falhou por rede ou tempo. | Aviso no topo. | `errors.unreachable` |

## Regra

- Bônus diário de 100 fichas, uma vez por dia, com resgate manual, pelo dia do calendário de Brasília. (Plano.md, «Decisões», Bônus diário)
- O botão de jogar online fica em destaque no menu. (Plano.md, fatia 2, «Decisões do Lucas (04/11/2026)»)
- Nomes, textos e ordem dos botões do menu, foto e ficha sem a palavra "Fichas", "(Pontinho)" abaixo do logo e bônus menor, sem anúncio. Como jogar e Ranking saem do menu. (Cliente e Lucas, 08/11/2026)
- Na web, cada tela entra deslizando 25 px e surgindo, em 200 ms, a não ser com a preferência de movimento reduzido ligada. O app nativo usa a animação do sistema. (Lucas, 08/11/2026)
- Títulos só com a inicial maiúscula; "(Pontinho)" e o saldo sem "Fichas" valem só no menu; os botões novos abrem telas vazias até a cliente definir o conteúdo. (Lucas, 08/11/2026)

## Testes

- `apps/api/src/modules/wallet/`: saldo, bônus diário e `dailyBonusAlreadyClaimed`.
- Sem teste automático: a tela do app.
