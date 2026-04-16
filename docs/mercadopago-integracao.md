# Integração Mercado Pago — Precifique

Documentação completa da integração de pagamentos do Precifique com Mercado Pago SDK v2 (Node.js), cobrindo arquitetura, fluxo, erros encontrados e soluções definitivas.

---

## Stack e versões

- **SDK**: `mercadopago` npm (v2.x) — Node.js, server-side only
- **Framework**: Next.js App Router (server routes em `/app/api/`)
- **Banco**: Supabase (tabela `usuarios_precifique`)
- **Ambiente**: Netlify (serverless functions)

---

## Variáveis de ambiente obrigatórias

```env
# Mercado Pago
MP_ACCESS_TOKEN=APP_USR-...          # Access token de produção (server-side)
NEXT_PUBLIC_MP_PUBLIC_KEY=APP_USR-... # Public key (usada na busca BIN)

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://....supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

# App
NEXT_PUBLIC_URL=https://calculadoraprecifique.com  # URL base para webhook MP
N8N_URL=https://cjota-n8n-02.9eo9b2.easypanel.host
```

---

## Arquitetura do fluxo

```
[Frontend /comprar]
       │
       ├─ 1. POST /api/checkout/criar-usuario
       │       Cria user no Supabase Auth + row em usuarios_precifique (status: pendente)
       │       Retorna: { userId, externalRef }
       │
       ├─ 2a. PIX → POST /api/checkout/processar-pagamento
       │       Cria pagamento PIX no MP
       │       Retorna: { qrCode, qrCodeBase64, paymentId }
       │       Frontend faz polling a cada 5s em GET /api/checkout/status
       │
       ├─ 2b. CARTÃO → POST /api/checkout/tokenizar-cartao
       │       BIN search + cria CardToken server-side
       │       Retorna: { token, paymentMethodId, issuerId }
       │       → POST /api/checkout/processar-pagamento
       │       Retorna: { status: 'approved' | 'rejected', paymentId }
       │
       └─ 3. Webhook MP → POST /api/webhook/mercadopago
               MP envia notificação de pagamento aprovado
               Ativa conta (status: ativo), confirma email no Auth
               Dispara WhatsApp via n8n (fire-and-forget)
```

---

## Rotas da API

### `POST /api/checkout/criar-usuario`

**Arquivo**: `app/api/checkout/criar-usuario/route.ts`

Cria a usuária no Supabase Auth e na tabela `usuarios_precifique` antes do pagamento.

**Campos recebidos**: `nome`, `email`, `telefone`, `nicho`, `senha`

**Lógica de idempotência**:
- Email já ativo → retorna 409
- Email pendente → reutiliza a row existente (usuária tentando de novo)
- Email já no Auth mas não no banco → cria row linkando o `auth_user_id` correto

**Retorna**: `{ userId, externalRef }` onde `externalRef = "precifique_${userId}"`

---

### `POST /api/checkout/tokenizar-cartao`

**Arquivo**: `app/api/checkout/tokenizar-cartao/route.ts`

Tokeniza o cartão **server-side** usando o SDK Node.js do MP (`CardToken`).

**Por que server-side?**
O SDK browser (`window.MercadoPago`) nunca carregava no Next.js App Router / Netlify. A solução definitiva foi mover toda a tokenização para o servidor.

**Fluxo interno**:
1. Recebe dados do cartão (número, nome, validade, CVV, CPF)
2. Extrai o BIN (primeiros 6 dígitos)
3. Faz BIN search na API do MP para identificar bandeira e emissor
4. Cria o token com `CardToken` do SDK incluindo `cardholder` (obrigatório no Brasil)
5. Retorna `{ token, paymentMethodId, issuerId }`

**BIN Search — URL correta**:
```
GET https://api.mercadopago.com/v1/payment_methods/search?bin={BIN}&public_key={NEXT_PUBLIC_MP_PUBLIC_KEY}
Authorization: Bearer {MP_ACCESS_TOKEN}
```
⚠️ A `public_key` deve vir como **query param**, não como header. Sem ela a resposta retorna vazia.

**Ordenação dos resultados do BIN**:
```typescript
const PRIORITY = ['visa', 'master', 'elo', 'amex', 'hipercard', 'diners', 'cabal', 'naranja', 'debvisa', 'debmaster', 'debelo']
const ranked = results
  .filter(r => PRIORITY.includes(r.id))
  .sort((a, b) => PRIORITY.indexOf(a.id) - PRIORITY.indexOf(b.id))
const method = ranked[0]
  ?? results.find(r => r.payment_type_id === 'credit_card')
  ?? results.find(r => r.payment_type_id === 'debit_card')
```
⚠️ Nunca use `results[0]` direto — o MP pode retornar `consumer_credits` ou `debelo` na primeira posição, causando erro `diff_param_bins`.

**Criação do token com cardholder**:
```typescript
const tokenBody = {
  card_number: numLimpo,
  expiration_month: String(expirationMonth),
  expiration_year: `20${expirationYear}`, // Ex: "26" → "2026"
  security_code: String(securityCode),
  cardholder: {
    name: cardholderName,
    identification: { type: 'CPF', number: cpf.replace(/\D/g, '') },
  },
} as unknown as CardTokenCreateBody
```
⚠️ O tipo `CardTokenCreateBody` do SDK **não inclui** o campo `cardholder`. É necessário fazer `as unknown as CardTokenCreateBody` para passar o TypeScript. O campo é obrigatório para aprovação no Brasil.

---

### `POST /api/checkout/processar-pagamento`

**Arquivo**: `app/api/checkout/processar-pagamento/route.ts`

Cria o pagamento no MP usando o SDK `Payment`.

**Campos recebidos**: `userId`, `externalRef`, `email`, `metodo` (`'pix'` | `'cartao'`), `cardToken`, `cpf`, `issuer`, `paymentMethodId`

**Validação de segurança**: Cruza `userId` + `externalRef` no banco antes de processar — evita pagamentos avulsos.

**Body para PIX**:
```typescript
{
  transaction_amount: 24.99,
  payment_method_id: 'pix',
  description: 'Precifique — Acesso Vitalício',
  external_reference: externalRef,
  notification_url: `${NEXT_PUBLIC_URL}/api/webhook/mercadopago`,
  payer: { email },
}
```

**Body para cartão**:
```typescript
{
  transaction_amount: 24.99,
  token: cardToken,         // Token gerado em tokenizar-cartao
  payment_method_id: paymentMethodId,  // Ex: 'visa', 'master'
  installments: 1,
  issuer_id: issuer,        // ID do banco emissor (string numérica)
  description: '...',
  external_reference: externalRef,
  notification_url: '...',
  payer: { email, identification: { type: 'CPF', number: cpf } },
}
```

**Mapeamento de erros de cartão**:
```typescript
const motivos: Record<string, string> = {
  cc_rejected_bad_filled_card_number: 'Número do cartão inválido.',
  cc_rejected_bad_filled_date: 'Data de validade inválida.',
  cc_rejected_bad_filled_security_code: 'CVV inválido.',
  cc_rejected_bad_filled_other: 'Dados do cartão incorretos.',
  cc_rejected_insufficient_amount: 'Saldo insuficiente.',
  cc_rejected_blacklist: 'Cartão não autorizado.',
  cc_rejected_call_for_authorize: 'Ligue para o banco para autorizar.',
  cc_rejected_duplicated_payment: 'Pagamento duplicado detectado.',
  cc_rejected_high_risk: 'Pagamento recusado por segurança.',
}
```

---

### `GET /api/checkout/status`

**Arquivo**: `app/api/checkout/status/route.ts`

Usado pelo frontend para polling do PIX (verificação a cada 5s).

Exige `paymentId` + `userId` cruzados — impede consulta avulsa de status.

Retorna apenas `{ status: 'pendente' | 'ativo' }` — sem dados extras expostos.

---

### `POST /api/webhook/mercadopago`

**Arquivo**: `app/api/webhook/mercadopago/route.ts`

Endpoint que o MP chama quando um pagamento é confirmado.

**Regras de idempotência implementadas**:
1. Se `body.type !== 'payment'` → ignora
2. Busca o pagamento na API do MP para confirmar `status === 'approved'`
3. Verifica se `payment_id` já ativou alguma conta → ignora se sim
4. Busca a usuária por `external_reference` OU `payment_id`
5. Update atômico: `UPDATE WHERE status = 'pendente'` — se outra requisição já ativou, o update retorna vazio e para
6. Confirma email no Supabase Auth (`email_confirm: true`)
7. Dispara WhatsApp via n8n (fire-and-forget, sem `await`)

**Sempre retorna 200** — se retornar 4xx ou 5xx o MP reenvia o webhook em loop.

O MP também faz `GET` no endpoint para verificar existência — exportar `GET` retornando 200.

---

## Erros encontrados e soluções

### Erro 1: `window.MercadoPago` nunca carrega

**Sintoma**: "Erro ao carregar o sistema de pagamento. Recarregue a página."

**Causa**: O SDK browser do MP (`@mercadopago/sdk-js`) nunca inicializava no ambiente Next.js App Router / Netlify. Tentativas com `createElement('script')`, `next/script` e `loadMercadoPago()` falharam.

**Solução definitiva**: Mover **toda** a tokenização para server-side usando `CardToken` do SDK Node.js (`mercadopago` npm). O browser nunca mais precisa carregar o SDK do MP.

---

### Erro 2: Código `3034 — invalid_card_number_validation`

**Sintoma**: Token criado mas pagamento rejeitado com `cause: [{ code: 3034 }]`

**Causa**: O `payment_method_id` enviado não correspondia ao BIN do cartão. O BIN search retornava `consumer_credits` como primeiro resultado e esse era usado.

**Solução**: Ordenar os resultados do BIN por lista de prioridade antes de usar. `consumer_credits` não está na lista de prioridade e é filtrado.

---

### Erro 3: `diff_param_bins` — BIN não bate com o paymentMethodId

**Sintoma**: Pagamento rejeitado com `status_detail: diff_param_bins`

**Causa**: `results.find()` iterava o array original (não ordenado por prioridade), pegando `debelo` para um cartão Visa.

**Solução**: Usar `.sort()` na lista PRIORITY antes de pegar `[0]`, não `.find()` que para no primeiro match do array original.

---

### Erro 4: BIN search retornando array vazio

**Sintoma**: `binData.results = []`, bandeira não identificada

**Causa**: A URL da BIN search não incluía o `public_key` como query param.

**Solução**:
```
/v1/payment_methods/search?bin={BIN}&public_key={NEXT_PUBLIC_MP_PUBLIC_KEY}
```
Ambos `public_key` (query) e `Authorization: Bearer {token}` (header) são necessários.

---

### Erro 5: TypeScript — `cardholder` não existe no tipo `CardTokenCreateBody`

**Sintoma**: Erro de compilação — propriedade `cardholder` não existe no tipo

**Causa**: O SDK v2 omitiu `cardholder` da tipagem, mas o campo é obrigatório para aprovação no Brasil.

**Solução**:
```typescript
} as unknown as CardTokenCreateBody
```
Cast duplo necessário. O campo funciona na runtime mesmo sem estar no tipo.

---

### Erro 6: Docker — `sh: tsc: not found`

**Sintoma**: Build do container falha com TypeScript não encontrado

**Causa**: `npm ci --only=production` pula devDependencies, onde o `typescript` está.

**Solução**: Usar `npm ci` (instala tudo) → build → `npm prune --production` (limpa depois).

```dockerfile
RUN npm ci
RUN npm run build
RUN npm prune --production
```

---

### Erro 7: GA `purchase` event perdido no redirect

**Sintoma**: Evento de compra não aparecia no Google Analytics

**Causa**: O redirect para `/login` acontecia em 2 segundos, antes do beacon do GA ser enviado pelo navegador.

**Solução**: Usar `event_callback` do GA com fallback de 1s:
```typescript
gtag('event', 'purchase', {
  ...params,
  event_callback: () => {
    if (timeout) clearTimeout(timeout)
    onDone?.()
  },
})
const timeout = setTimeout(onDone, 1000) // fallback se GA bloqueado
```

---

## Validação Luhn (client-side)

Validação básica do número do cartão antes de enviar ao servidor:

```typescript
function luhn(num: string): boolean {
  const d = num.replace(/\D/g, '')
  let sum = 0
  let alt = false
  for (let i = d.length - 1; i >= 0; i--) {
    let n = parseInt(d[i], 10)
    if (alt) { n *= 2; if (n > 9) n -= 9 }
    sum += n
    alt = !alt
  }
  return sum % 10 === 0
}
```

---

## Tabela de banco — `usuarios_precifique`

```sql
CREATE TABLE usuarios_precifique (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id    UUID UNIQUE,        -- FK para Supabase Auth
  nome            TEXT NOT NULL,
  email           TEXT NOT NULL UNIQUE,
  telefone        TEXT,
  nicho           TEXT,
  status          TEXT DEFAULT 'pendente' CHECK (status IN ('pendente', 'ativo', 'cancelado')),
  mp_payment_id   TEXT,               -- ID do pagamento MP
  mp_external_ref TEXT UNIQUE,        -- "precifique_{userId}"
  plano           TEXT DEFAULT 'vitalicio',
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  ativado_em      TIMESTAMPTZ
);
```

O `mp_external_ref` é a chave de ligação entre o checkout e o webhook.

---

## Checklist de produção

- [ ] `MP_ACCESS_TOKEN` é o token de **produção** (não sandbox)
- [ ] `NEXT_PUBLIC_URL` aponta para o domínio real (usado no `notification_url` do webhook)
- [ ] Webhook registrado no painel MP: `https://calculadoraprecifique.com/api/webhook/mercadopago`
- [ ] `SUPABASE_SERVICE_ROLE_KEY` configurada no Netlify
- [ ] `N8N_URL` configurada no Netlify
