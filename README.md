# Checkout BFF · Front

Tela de checkout de assinaturas feita em **Angular 22** com **Tailwind CSS 4**. É o frontend do **Checkout BFF** (repositório `checkout-bff`): mostra o plano escolhido, recebe o pagamento por cartão de crédito, débito ou Pix e leva o usuário para a tela de sucesso ou de erro.

O projeto roda sozinho, **sem precisar do backend**: por padrão ele usa um backend simulado no próprio navegador, com as mesmas regras e as mesmas mensagens do BFF. Quando o BFF está rodando, um único comando troca para a API de verdade.

---

## Destaques

- **Três telas do desafio:** pagamento, sucesso e erro, seguindo o layout do Figma (cabeçalho "Checkout seguro", etapas Pedido → Pagamento → Confirmação, resumo do pedido ao lado).
- **Validação de cartão completa:** número (com verificação Luhn e detecção da bandeira), nome do titular, validade no formato `MM/AA` e no futuro, e CVV de 3 ou 4 dígitos. Máscaras enquanto digita e foco automático no primeiro campo com erro.
- **Pix com QR Code real:** o código "copia e cola" segue o padrão do Banco Central (com checksum) e o QR é gerado a partir dele. Botão para copiar e para concluir o pagamento.
- **Processamento simulado:** o pagamento passa por uma etapa de "processando" e pode terminar em aprovação ou recusa, como no BFF.
- **Tela de erro guiada pelo backend:** título, mensagem e botões ("Tentar novamente", "Trocar meio de pagamento") vêm do contrato de erro do BFF, então qualquer erro novo aparece certo sem mudar o front.
- **Estado compartilhado e seguro:** as telas compartilham o estado do pagamento em memória. Recarregar ou abrir `/checkout/sucesso` ou `/checkout/erro` direto pela URL, sem um pagamento feito, leva de volta ao pagamento.
- **Dados de cartão protegidos:** número e CVV ficam só em memória, nunca em `localStorage`, cookies ou na URL. As telas seguintes mostram apenas os 4 últimos dígitos.
- **Responsivo e acessível:** layout pensado para celular e desktop, campos com `label` e `autocomplete` corretos, anúncios de erro e de processamento para leitores de tela.
- **Testes e CI:** testes unitários de regras, componentes e estado, mais testes da jornada completa passando pelas rotas reais. Esteira no GitHub Actions.

**Tecnologias:** Angular 22 (standalone, signals, zoneless), Tailwind CSS 4, Vitest, Prettier, Docker e nginx.

---

## Como rodar

### Pré-requisito

**[Node.js 22](https://nodejs.org/)** (a versão está no arquivo `.nvmrc`; com `nvm`, basta rodar `nvm use`).

### Instalar e subir

Na pasta do projeto:

```bash
npm install
npm start
```

Abra **http://localhost:4200**. Pronto: o checkout já funciona com o backend simulado.

### Usando o BFF de verdade

Com o Checkout BFF rodando em `http://localhost:8080` (`docker compose --profile app up --build` na pasta dele), rode:

```bash
npm run start:bff
```

O servidor de desenvolvimento encaminha as chamadas de `/operations` para o BFF, então não é preciso configurar CORS.

### Pelo Docker (opcional)

Para quem prefere não instalar o Node:

```bash
docker build -t checkout-bff-front .
docker run --rm -p 4200:80 checkout-bff-front
```

E abra **http://localhost:4200**. A imagem usa o backend simulado.

---

## Como testar as telas

### Planos

O plano vem pela URL, no parâmetro `plano`. Sem ele, o checkout abre o Premium.

| Endereço | Plano | Preço |
| --- | --- | --- |
| http://localhost:4200/checkout/pagamento?plano=basico | Plano Básico | R$ 19,90 |
| http://localhost:4200/checkout/pagamento?plano=premium | Plano Premium | R$ 39,90 |
| http://localhost:4200/checkout/pagamento?plano=familia | Plano Família | R$ 59,90 |

Um plano que não existe (por exemplo `?plano=ultra`) mostra o aviso de produto indisponível.

### Cartões

| Cenário | Número | Resultado |
| --- | --- | --- |
| Aprovado | `4242 4242 4242 4242` | Tela de sucesso |
| Recusado | `4000 0000 0000 0002` (qualquer número válido terminado em `0002`) | Tela de erro |

Qualquer nome, validade no futuro (por exemplo `12/30`) e CVV de 3 dígitos. Outros números válidos, como `5555 5555 5555 4444` (Mastercard), também são aprovados.

### Pix

Escolha **Pix**, veja o QR Code e o código copia e cola, e clique em **Concluir pagamento**. O Pix é sempre aprovado.

### Roteiro rápido

1. Pague com o cartão recusado e veja a tela de erro.
2. Clique em **Tentar novamente**: o mesmo pagamento é reenviado e recusado de novo.
3. Clique em **Trocar meio de pagamento**, escolha Pix e conclua: tela de sucesso.
4. Recarregue a página de sucesso: você volta para o pagamento, porque o estado não fica salvo.

---

## Rodando os testes

```bash
npm test             # modo watch
npm run test:ci      # uma execução, como na esteira
npm run format:check # padrão de formatação (Prettier)
```

Os testes ficam ao lado de cada arquivo (`*.spec.ts`). O arquivo `src/app/checkout.journey.spec.ts` percorre a jornada inteira: aprovação no cartão, recusa seguida de Pix, débito, acesso direto às telas de resultado e plano inexistente.

---

## Estrutura do projeto

```
src/app
├── core
│   ├── api          cliente HTTP do BFF e tratamento do contrato de erro
│   ├── config       configuração, relógio injetável e locale pt-BR
│   ├── http         interceptor de correlation id
│   ├── mock         backend simulado com as regras do BFF
│   ├── models       tipos do contrato da API
│   └── state        estado do checkout (signals) e navegação entre telas
├── features
│   ├── payment      tela de pagamento: resumo, meios, cartão, Pix, processamento
│   └── result       telas de sucesso e erro, e os guards de acesso
├── layout           cabeçalho, etapas e rodapé
└── shared           regras de cartão e Pix, validadores, ícones e avisos
```

---

## Decisões

- **Tailwind CSS em vez de Bootstrap:** o layout do Figma é bem específico (cards, espaçamentos, tons de cinza e índigo). Com Tailwind ele foi reproduzido direto nos templates, sem sobrescrever estilos de componentes prontos e sem CSS extra no bundle.
- **Backend simulado como padrão:** o avaliador consegue ver todas as telas só com `npm start`. O mock é um interceptor HTTP, então o resto do app faz as mesmas chamadas que faria ao BFF; trocar para a API real é só uma configuração de ambiente.
- **Contrato de erro do BFF como fonte da verdade:** a tela de erro renderiza o `frontendError` que chega (título, descrição e botões). Se o BFF estiver fora do ar, o front mostra um erro próprio no mesmo formato.
- **Estado só em memória:** é o que o desafio pede ao dizer que recarregar sucesso ou erro sem dados deve redirecionar. Também evita guardar dados de pagamento no navegador. Os guards de rota fazem o redirecionamento.
- **"Tentar novamente" reenvia o mesmo pedido:** o carrinho e os dados digitados são mantidos em memória, então o usuário não precisa preencher tudo de novo. O BFF garante que não há cobrança duplicada.
- **Signals no lugar de NgRx:** o estado é pequeno (um carrinho, uma tentativa, um resultado). Um serviço com signals resolve com menos código e continua fácil de testar.
- **Relógio injetável:** validade do cartão, data do pagamento e próxima renovação dependem da data atual. Um token `CLOCK`, como o `Clock` do BFF, deixa os testes determinísticos.
- **Testes de jornada com Vitest em vez de Playwright:** cobrem as rotas, os guards e as telas reais com o backend simulado e sem latência, rodam em segundos e não exigem navegador na esteira.

### O que ficou de fora

- **Botões do Figma sem destino no desafio**, como "Acessar meu espaço" e "Ver recibo": foram trocados por **Fazer nova compra** e **Imprimir comprovante**, que funcionam de verdade.
- **Envio de comprovante por e-mail:** depende de um serviço que o BFF não tem.
- **Seleção de plano:** o desafio parte do checkout. O plano vem pela URL, e o botão **Escolher plano**, que o BFF envia em erros como carrinho expirado, recomeça o checkout com um carrinho novo.
- **Pagamento Pix real (aguardar confirmação do banco):** o desafio pede um Pix simulado, então a confirmação é manual pelo botão **Concluir pagamento**.
- **Internacionalização:** os textos estão em português, como no Figma; moeda e datas usam o locale pt-BR.
- **Testes end-to-end em navegador:** a jornada já é coberta pelos testes de integração. Playwright seria o próximo passo para testar contra o BFF rodando.
