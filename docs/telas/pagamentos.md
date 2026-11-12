# Pagamentos

Aberto pelo menu (Pagamento). Tem três caminhos: Comprar fichas, só por Pix; Cadastrar chave Pix, que cadastra a chave Pix do CPF para o saque; e Dados bancários, com banco, agência, conta e tipo de uma conta no CPF do jogador.

Código: `apps/mobile/src/app/payments.tsx`, `apps/mobile/src/app/store.tsx` e `apps/mobile/src/features/store/` (`PaymentsScreen.tsx`, `usePixKey.ts`, `BankAccountScreen.tsx`, `banks.ts`, `ChipStore.tsx`, `PixPayment.tsx`, `useQuote.ts` e `usePurchase.ts`); na API, `apps/api/src/modules/profile/` (chave Pix) e `apps/api/src/modules/store/` (compra).

## Chamadas

| Ação | Chamada | Sucesso |
|---|---|---|
| Abrir | `GET /wallet` e `GET /profile` (do cache) | Mostra o saldo e se a chave Pix já foi cadastrada. |
| Comprar fichas | Abre `/store`: `GET /store/quote?quantity=` a cada quantidade e `POST /store/purchases` com `Idempotency-Key` ao tocar em Comprar | A compra fica pendente e a tela mostra o QR Code, o Pix Copia e Cola com "Copiar código" e "Aguardando pagamento". O app consulta `GET /store/purchases/{id}` a cada 2 s; quando a compra é paga, volta à compra com a confirmação e o saldo relido. Com o provedor de teste, a compra é paga 5 s depois de criada. |
| Dados bancários | `PUT /profile/bank-account` com banco (da lista ou "Outro banco", com código e nome), agência, conta, dígito e tipo | Volta para Pagamento com o banco, a agência e a conta no cartão. A conta pode ser trocada depois. |
| Cadastrar chave Pix | `PUT /profile/pix-key`, sem corpo, ao tocar em "Cadastrar chave" | Volta para Pagamentos com "Chave Pix (CPF)" e o CPF mascarado. Depois disso, o cartão não abre mais. |

- A chave é sempre do tipo CPF e vem do cadastro, travada: a tela só mostra o CPF e pede o aceite.
- A forma de pagamento mostra só o Pix, já escolhido. Até existir o provedor de Pix, a compra é de teste e não cobra nada, sem QR Code.
- Repetir a mesma compra (mesma quantidade, depois de uma falha) reaproveita a `Idempotency-Key`, para não comprar duas vezes.

## Erros

Os erros que valem para toda rota estão em [erros comuns](erros-comuns.md).

| Código da API | Status | Quando | Tratamento no app | Chave do texto |
|---|---|---|---|---|
| `registrationRequired` | 409 | A conta não tem cadastro ao cadastrar a chave. Não deve acontecer, porque o guard leva ao cadastro antes. | Erro genérico acima do botão. | `errors.generic` |
| `quantityAboveMaximum` | 422 | A quantidade passou do máximo por compra. | Aviso na loja. | `errors.quantityAboveMaximum` |
| `idempotencyKeyReused` | 409 | A mesma `Idempotency-Key` veio com outra quantidade. É bug do app, que troca a chave quando a quantidade muda. | Aviso genérico na loja. | `errors.generic` |
| `validationFailed` | 400 | Quantidade fora do passo ou do mínimo. O app só anda em passos de 1.000. | Aviso genérico na loja. | `errors.generic` |

### Falhas sem resposta útil da API

| Falha | Quando | Tratamento no app | Chave do texto |
|---|---|---|---|
| sem conexão na carteira | `GET /wallet` falhou. | Saldo "—" e aviso com "Tentar de novo". | `errors.unreachable` |
| tempo esgotado na compra | `POST /store/purchases` passou do limite. | Aviso para conferir o saldo antes de tentar de novo. | `errors.purchaseUnconfirmed` |
| sem conexão na compra ou na cotação | O `fetch` falhou. | Aviso na loja; a cotação tem "Tentar de novo". | `errors.unreachable` |
| sem conexão na chave Pix | `PUT /profile/pix-key` falhou. | Erro acima do botão; dá para tocar de novo. | `errors.unreachable` |

## Regra

- Compra de fichas só por Pix, sem cartão por enquanto. Até existir o provedor de pagamento, a loja mostra quantidade e valor e não cobra nada. (Plano.md, «Decisões», Compra de fichas)
- Saque por Pix, só para chave Pix do tipo CPF, preenchida com o CPF do cadastro. (Plano.md, «Decisões», Saque)
- O Pix segue a tela do protótipo, com o provedor de teste, e "Cadastrar chave" vale como aceite. (Plano.md, fatia 2, «Decisões do Lucas (04/11/2026)»)
- A compra continua de teste, aprovada na hora e sem QR Code, até o provedor de verdade (fatia 5). (Lucas, 04/11/2026, plano da fatia 2 aprovado: "segue as sugestões")
- A chave grava a data do aceite uma vez só; repetir a chamada não muda a data. É comportamento do código.
- O pedido de saque não está nesta fatia. (Plano.md, «Próximas fatias», item 5)

- Três caminhos em Pagamento: Comprar fichas, Cadastrar chave Pix e Dados bancários. Os dados bancários pedem banco, agência, conta e tipo, numa conta no CPF do jogador, porque a chave Pix sozinha não mostra a conta. (Cliente, 11/11/2026; Lucas, 12/11/2026: lista curta de bancos digitada, com "Outro banco")
- Compra por Pix com QR Code e Copia e Cola na tela, que confirma sozinha quando o pagamento cai. Até escolher o provedor real, o Pix é simulado: o provedor de teste deixa a compra pendente e a aprova 5 s depois. (Cliente, 11/11/2026; Lucas, 11/11/2026)

## Testes

- `apps/api/src/modules/profile/profile.routes.spec.ts`: chave cadastrada uma vez só e recusada antes do cadastro.
- `apps/api/src/modules/store/`: cotação, compra de teste, máximo por compra e `Idempotency-Key`.
- Sem teste automático: as telas do app.
