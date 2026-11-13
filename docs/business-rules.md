# Regras de negócio

As regras do DotWizer num lugar só, conferidas em 13/11/2026. Cada regra traz a fonte entre parênteses. Regras.md e Plano.md ficam no Obsidian, em `dotwize/`. "Código" quer dizer que a regra está implementada, mas nenhuma decisão escrita a cobre.

O detalhe de cada tela e de cada caso de uso do jogo, com chamadas e erros, fica em [`telas`](telas) e [`jogo`](jogo). O que está em aberto fica no fim.

## Conta e cadastro

### Login
- Entrada por e-mail com código de 6 dígitos ou pelo Google, na web e no celular. Apple quando o app for publicado no iPhone. (Plano.md, «Decisões», Login)
- Senha opcional, com 8 caracteres ou mais, criada ou trocada no perfil. Quem tem senha pode entrar com ela; o código e o Google continuam valendo. Quem esqueceu a senha entra pelo código e troca no perfil. (Cliente, 11/11/2026; Lucas, 11/11/2026)

### Cadastro
- Só maiores de 18 anos. A data de nascimento é pedida no cadastro e menores são bloqueados. (Plano.md, «Decisões», Idade)
- O cadastro pede nome completo, CPF, data de nascimento e apelido. Não tem foto, que fica para o perfil. (Plano.md, fatia 2, «Decisões do Lucas (04/11/2026)»)
- Nome completo, CPF e nascimento são pedidos uma vez e travam ao salvar, porque o saque vai para a conta no CPF da pessoa. Antes de travar, há uma tela de conferência, que avisa que os dados pessoais não poderão ser alterados. (Plano.md, «Decisões», Cadastro; cliente, 02/11/2026)
- Um CPF por conta, com os dígitos verificadores conferidos. (Plano.md, «Decisões», Cadastro)
- Nome completo de 1 a 100 caracteres, sem exigir sobrenome. (Lucas, 04/11/2026)
- Apelido de 3 a 15 caracteres, com letras (inclusive acento e ç), números, espaço e símbolos do teclado, sem emoji. Não precisa ser único. Apelido já gravado fora da regra continua valendo até a pessoa salvar outro. (Lucas, 04/11, 06/11 e 08/11/2026)
- Para entrar em qualquer partida, inclusive no treino com robôs, o cadastro precisa estar completo. Contas sem CPF vão para o cadastro ao entrar. (Regras.md, «Tipos de partida»; Plano.md, fatia 2)

### Perfil
- Podem mudar: foto, apelido, celular, endereço e senha. Nome, CPF e nascimento aparecem sem edição, com o CPF mascarado. (Plano.md, fatia 2, Perfil)
- O e-mail aparece só para leitura. (Plano.md, «Cortes do Lucas (05/11/2026)»)
- Celular opcional, com 11 dígitos e sem confirmação por SMS. (Plano.md, «Cortes do Lucas (05/11/2026)» e «Decisões», Contato)
- Endereço opcional: CEP, rua, número, complemento, bairro, cidade e UF. O CEP preenche o resto pelo ViaCEP. (Cliente, 11/11/2026; Lucas, 11/11/2026)
- Foto da galeria. Até chegarem os bonecos da cliente, quem não tem foto aparece com a inicial do nome. (Plano.md, fatia 2, «Decisões do Lucas (04/11/2026)»)

### Excluir conta
- Excluir a conta desativa a conta e mantém o extrato. (Plano.md, «Decisões», Excluir conta)
- O CPF continua preso à conta desativada, e a exclusão é recusada enquanto a pessoa tem uma partida aberta. (Lucas, 04/11/2026)

## Tipos de partida

### Mesas
Existem 7 mesas, cada uma com um saldo mínimo e um valor do ponto. O saldo mínimo é só requisito para entrar: nada é descontado na entrada. (Regras.md, «Mesas e saldo mínimo»)

| Mesa | Saldo mínimo | Valor do ponto |
|---|---|---|
| 1 | 1.000 fichas | 1 ficha |
| 2 | 5.000 | 5 |
| 3 | 10.000 | 10 |
| 4 | 20.000 | 20 |
| 5 | 50.000 | 50 |
| 6 | 100.000 | 100 |
| 7 | 200.000 | 200 |

No app, a mesa se chama pelo valor do ponto ("1 ficha por ponto", com "Mín. 1.000 fichas" embaixo), sem número nem a palavra aposta. (Cliente, 09/11/2026; Lucas, 10/11/2026)

### Online
- Vale fichas da carteira, numa das 7 mesas, com 4 lugares. Usa só o coringão. (Regras.md, «Tipos de partida»)
- A partida começa quando a mesa enche ou, com 3 pessoas sentadas, depois de uma contagem de 10 s. A contagem para se a mesa cair para 2. (Regras.md, «Tipos de partida»)
- A lista de mesas mostra quem espera em cada uma, com apelido e foto, nunca o nome completo, e se atualiza sozinha a cada 5 s. (Plano.md, «Decisões», Partida online; Lucas, 10/11/2026)
- Ao tocar numa mesa, o app pede confirmação. Depois de entrar, o Sair fica bloqueado nos primeiros 30 s e libera até a partida começar. O bloqueio é só no app: fechar o app ainda tira a pessoa da mesa. (Cliente, 09/11/2026; Lucas, 10/11/2026)
- Se duas pessoas tentam o último lugar, a segunda abre outra sala na mesma mesa. (Lucas, 04/11/2026)

### Treino com robôs
- Só treino, sem nenhuma movimentação de fichas. (Regras.md, «Tipos de partida»)
- O jogador escolhe de 3 a 6 jogadores e o coringa: só o coringão ou também o coringa de vida (no app, "Coringa" e "Coringa de vira"). (Cliente, 02/11/2026 e 11/11/2026)
- Os robôs jogam completo: compram, baixam os jogos que a mão permite, encaixam o que cabe e descartam uma carta aleatória entre as que podem ser descartadas. Esperam 3 s antes de jogar, para dar tempo de alguém bater na vez deles. (Regras.md, «Mesa e turnos»)

### Com amigos
- Sala privada, aberta por link ou pelo código de 6 caracteres, sem 0, O, 1 e I. Não aparece na lista de mesas. (Cliente, 11/11/2026; Lucas, 11/11/2026)
- Quem cria escolhe de 3 a 6 lugares, o coringa (como no treino) e uma das 7 mesas. (Lucas, 12/11/2026)
- Não vale fichas da carteira: todos começam com o saldo mínimo da mesa escolhida, as fichas passam entre os jogadores só dentro da partida, e não há bônus de vitória nem saldo mínimo para entrar. O resultado de cada um fica gravado para o ranking. (Lucas, 12/11/2026)
- A partida começa quando os lugares enchem ou quando o dono toca em Começar, com pelo menos 3 pessoas. Se o dono sai, o próximo da mesa vira dono. Não há bloqueio de 30 s no Sair. (Lucas, 12/11/2026)
- Quem cai guarda o lugar e volta, como na mesa online. (Lucas, 11/11/2026)

### Uma partida por vez
- Uma conta ocupa um lugar só. Enquanto a partida de alguém não acaba, essa pessoa não entra em outra, nem no treino; ao tentar, o app oferece voltar à partida em andamento. Quem foi eliminado fica livre. (Regras.md, «Quem cai ou sai»; Plano.md, «Feito»)

## Regras do jogo

### Baralho e distribuição
- 2 baralhos de 52 cartas e 4 coringas, num total de 108 cartas. Cada jogador recebe 9 cartas; ao comprar fica com 10 e descarta uma. (Regras.md, «Baralho e distribuição»)
- Quando o monte acaba, o descarte é embaralhado e vira o novo monte; só a última carta descartada fica aberta. Se o monte e o descarte acabarem, a rodada termina sem batida. (Regras.md, «Baralho e distribuição»)

### Mesa e turnos
- A cada rodada, quem dá as cartas é o próximo à esquerda, pulando quem está fora da partida e quem foi eliminado. Começa quem está à esquerda de quem deu, e a vez passa sempre para a esquerda. (Regras.md, «Mesa e turnos»)
- Cada jogador tem 30 s na vez. Se o tempo acaba, o jogo compra do monte (se ele ainda não comprou) e descarta uma carta aleatória entre as que podem ser descartadas, sem baixar, encaixar nem bater. Se nenhuma carta pode ser descartada, passa a vez. Se a pessoa já tinha baixado tudo e sobrou uma carta, esse descarte vale como batida. (Cliente, 02/11/2026)
- Quem está offline tem 3 s na vez, e o jogo faz o mesmo movimento por ele. (Regras.md, «Mesa e turnos»)

### Coringas
- **Coringão:** os 4 coringas do baralho, em toda partida. (Regras.md, «Coringas»)
- **Coringa de vida** ("Coringa de vira" no app), se escolhido no treino ou na sala com amigos: no começo da rodada vira-se uma carta, e valem como coringa as cartas seguintes na sequência, nos dois naipes da cor da virada. Rei virado faz o ás ser coringa. Coringão virado volta para o fundo do monte e vira-se outra. (Regras.md, «Coringas»; Lucas, 04/11/2026)
- O coringa de vida vale como o coringão em tudo e é sempre coringa: não entra numa trinca como carta comum e, numa sequência do próprio naipe, conta no limite de 2 coringas. (Lucas, 04/11/2026)
- O coringa nunca pode ser descartado. (Regras.md, «Descarte»)

### Valor das cartas
- Coringa 20 pontos, inclusive solto na mão; ás 15; valete, dama e rei 10; de 2 a 10, o próprio número. (Regras.md, «Valor das cartas»)

### Descarte e compra
- Na sua vez, você só pode pegar o descarte do jogador anterior, e só para usar a carta num jogo na mesma hora. Quem tem uma carta só na mão não pode pegar do descarte. (Regras.md, «Descarte»)
- Não pode descartar uma carta que encaixa num jogo da mesa, inclusive no lugar de um coringa. (Regras.md, «Descarte»)

### Jogos
- Pode baixar jogos em qualquer vez sua, depois de comprar e antes de descartar, sem rodada mínima. (Regras.md, «Baixar jogos»)
- **Trinca:** cartas do mesmo valor, que começa com 3 ou 4 naipes diferentes. Depois de baixada, aceita repetidas de um naipe que já está nela, mas não a do naipe que falta. (Regras.md, «Trincas»)
- **Sequência:** o ás vale alto ou baixo (A-2-3 e Q-K-A), sem dar a volta (K-A-2 não vale). (Regras.md, «Sequências»)
- Ao trocar um coringa da mesa pela carta verdadeira, o coringa não volta para a mão: vai na hora para outro jogo ou começa um novo, e só fica na ponta se for a jogada da batida. (Regras.md, «Sequências»)

### Batida
- Bate quem fica sem cartas, descartando a última ou jogando todas na mesa. (Regras.md, «Batida»)
- Bater fora da vez só vale com a carta do descarte que o jogador da vez não quis, usada para bater a mão inteira de uma vez. Quando ele compra do monte, a carta fica livre para qualquer outro, menos quem a descartou. (Regras.md, «Batida»)
- Blefe é anunciar a batida e não conseguir fechar todos os jogos. Quem blefa não leva pontos; a única penalidade é não poder mais bater fora da vez naquela rodada. (Regras.md, «Batida»)

### Monte acabou sem batida
- Vence a rodada quem tem a menor pontuação acumulada; os outros somam os pontos da mão e pagam a ele. Empate: vence quem tem menos pontos na mão nesta rodada e, depois, quem está mais perto de quem deu as cartas, contando da esquerda dele. Isso não encerra a partida. (Regras.md, «Monte acabou sem batida»)

### Passou de 100 e volta
- Com exatamente 100 pontos, o jogador continua. (Regras.md, «Passou de 100 e volta»)
- Se sobrarem dois ou mais com até 100, quem passou pode voltar sem custo, com a maior pontuação entre os que ficaram. Tem 15 s para decidir; sem resposta, volta. Quem está offline volta sozinho. (Regras.md, «Passou de 100 e volta»)
- Quem não volta é eliminado e fica livre para outra partida. A partida segue, mesmo com 2 jogadores. (Regras.md, «Passou de 100 e volta»)

### Fim da partida
- Termina quando só um jogador fica com até 100 pontos, e ele vence. Quem está fora da partida conta, com a pontuação que tinha; se o vencedor estiver fora da partida, vence sem bônus. (Regras.md, «Fim da partida»)
- Se a partida cai por falha nossa (API fora do ar, servidor do jogo caiu ou reiniciou), acaba sem vencedor: valem as rodadas já pagas, a rodada em andamento não conta e ninguém leva bônus. (Regras.md, «Fim da partida»)

### Quem cai ou sai
- Quem perde a conexão tem 2 minutos para voltar e segue na mesma rodada. O app volta sozinho para a partida, inclusive ao ser reaberto. (Regras.md, «Quem cai ou sai»; cliente, 02/11/2026)
- Quem sai de vez (pelo Sair ou por não voltar em 2 minutos) termina a rodada em andamento e, da seguinte em diante, fica fora da partida. Enquanto está offline, o jogo joga por ele e ele paga e recebe normalmente. (Regras.md, «Quem cai ou sai»; cliente, 02/11/2026)
- Quem está fora da partida pode voltar a qualquer momento enquanto ela existir, inclusive de outro aparelho, com a pontuação que tinha e sem precisar do saldo mínimo. (Regras.md, «Quem cai ou sai»)
- Se sobrar uma pessoa só em jogo, a partida acaba no fim da rodada, e ela vence sem bônus. Se todos saírem, o jogo termina a rodada, paga e a partida acaba sem vencedor. (Regras.md, «Quem cai ou sai»)

## Fichas

### Por rodada
- Pontuação do jogo e saldo de fichas são separados, e não existe pote. (Regras.md, «Fichas por rodada»)
- Quem bateu não paga. Cada um dos outros paga os pontos que ficaram na mão vezes o valor do ponto da mesa, e quem bateu recebe a soma do que foi pago. Quem está fora da partida não paga nem recebe. (Regras.md, «Fichas por rodada»)

### Déficit
- Ninguém é eliminado por chegar a zero fichas. Quem deve mais do que tem paga só o que tem, e o resto vira déficit naquela partida, abatido dos ganhos dele mais tarde, na mesma partida. O valor abatido fica com a casa. (Regras.md, «Saldo zerado e déficit»)
- A carteira nunca fica negativa, e nenhuma dívida passa para a próxima partida. (Regras.md, «Saldo zerado e déficit» e «Histórico da partida»)

### Bônus
- **Vitória:** o vencedor recebe da casa 10 vezes o valor do ponto da mesa, registrado à parte. Não há bônus quando ele vence porque os outros saíram, quando está fora da partida, nem quando a partida cai por falha nossa. (Regras.md, «Bônus de vitória»)
- **Diário:** 100 fichas, uma vez por dia do calendário de Brasília, com resgate manual. Substitui as fichas grátis de cadastro. (Plano.md, «Decisões», Bônus diário)

### Histórico
- Cada partida guarda, por jogador, o saldo inicial, os pagamentos, os recebimentos, o déficit, o bônus de vitória, o resultado e o saldo final. O saldo final de quem foi eliminado é o do momento da eliminação. (Regras.md, «Histórico da partida»)

## Pagamentos

- **Compra:** só por Pix, sem cartão por enquanto. (Plano.md, «Decisões», Compra de fichas)
- O app mostra o QR Code e o Pix Copia e Cola, e a compra confirma sozinha quando o pagamento cai. Até existir o provedor real, o Pix é simulado: a compra fica pendente e é aprovada 5 s depois, sem cobrar nada. (Cliente, 11/11/2026; Lucas, 11/11/2026)
- Cada compra vai de 1.000 a 200.000 fichas. (Código: `CHIP_PURCHASE_MINIMUM` e `MAX_CHIPS_PER_PURCHASE`)
- **Saque:** por Pix, só para chave do tipo CPF, preenchida com o CPF do cadastro. Cadastrar a chave vale como aceite. O pedido de saque ainda não existe. (Plano.md, «Decisões», Saque, e fatia 2)
- **Dados bancários:** banco, agência, conta com dígito e tipo (corrente ou poupança), sempre numa conta no CPF do jogador. O banco vem de uma lista curta, com "Outro banco". (Cliente, 11/11/2026; Lucas, 12/11/2026)

## Políticas

- **Privacidade na mesa:** os outros jogadores veem só o apelido e a foto, nunca o nome completo. (Plano.md, fatia 2, «Decisões do Lucas (04/11/2026)»)
- **Limites de uso:** cada IP pode fazer 120 chamadas por minuto à API e entrar em salas do jogo 30 vezes por minuto. (Código: `RATE_LIMIT_MAX` e `entryLimit`)
- **Testes antes das lojas:** há autorização para testar compra e saque por Pix antes de publicar. (Plano.md, «Decisões», Saque)
- **Lojas:** com saque, o app passa a ser jogo a dinheiro (Apple 5.3.3 e a política do Google para jogos com dinheiro). Publicar pede parecer jurídico, licença, CNPJ e as contas de desenvolvedor da empresa. (Plano.md, «Em aberto» e «Antes de publicar nas lojas»)
- **Fora por enquanto:** som, vibração, chat, assistir partidas, grupo do WhatsApp, fichas por vídeo e ranking (o resultado das salas com amigos já é gravado). (Plano.md, «Decisões» e fatia 2)

## Em aberto

- **Preço da ficha:** a decidir. A API usa R$ 1,00 por ficha como valor provisório (`CHIP_PRICE_CENTS`). (Plano.md, «Em aberto»)
- **Penalidade para quem sai da partida:** a definir. (Regras.md, «Quem cai ou sai»)
- **Pontuação do ranking:** a definir. (Plano.md, fatia 2, Ranking)
- **Pix de verdade:** depende de escolher o provedor de pagamento. (Plano.md, «Próximas fatias», item 5)
