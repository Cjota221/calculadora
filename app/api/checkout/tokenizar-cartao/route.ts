import { NextRequest, NextResponse } from 'next/server'
import { CardToken, MercadoPagoConfig } from 'mercadopago'
import type { CardTokenCreateBody } from 'mercadopago/dist/clients/cardToken/create/types'

const mpClient = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN!,
  options: { timeout: 10000 },
})
const cardToken = new CardToken(mpClient)

export async function POST(req: NextRequest) {
  try {
    const { cardNumber, cardholderName, expirationMonth, expirationYear, securityCode, cpf } = await req.json()

    if (!cardNumber || !cardholderName || !expirationMonth || !expirationYear || !securityCode || !cpf) {
      return NextResponse.json({ error: 'Dados do cartão incompletos.' }, { status: 400 })
    }

    const numLimpo = cardNumber.replace(/\s/g, '')
    const bin = numLimpo.slice(0, 6)
    console.log('[tokenizar] bin:', bin, 'exp:', expirationMonth, '/', expirationYear)

    // Buscar payment_method_id e issuer pelo BIN
    const binRes = await fetch(
      `https://api.mercadopago.com/v1/payment_methods/search?bin=${bin}`,
      { headers: { Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}` } }
    )
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const binData: any = await binRes.json()
    const method = binData?.results?.[0]
    const paymentMethodId: string = method?.id ?? ''
    const issuerId: string = String(method?.issuer?.id ?? '')
    console.log('[tokenizar] paymentMethodId:', paymentMethodId, 'issuerId:', issuerId)

    if (!paymentMethodId) {
      return NextResponse.json({ error: 'Bandeira do cartão não identificada. Verifique o número.' }, { status: 422 })
    }

    // Criar token — incluindo cardholder (obrigatório para validação no Brasil)
    // O SDK omitiu cardholder do tipo, então fazemos cast
    const tokenBody = {
      card_number: numLimpo,
      expiration_month: String(expirationMonth),
      expiration_year: `20${expirationYear}`,
      security_code: String(securityCode),
      cardholder: {
        name: cardholderName,
        identification: { type: 'CPF', number: cpf.replace(/\D/g, '') },
      },
    } as unknown as CardTokenCreateBody

    console.log('[tokenizar] criando token com cardholder...')
    const token = await cardToken.create({ body: tokenBody })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tokenAny = token as any
    console.log('[tokenizar] token id:', token?.id, 'luhn_validation:', tokenAny?.luhn_validation, 'status:', tokenAny?.status)

    if (!token?.id) {
      console.error('[tokenizar] token sem id, resposta completa:', JSON.stringify(token))
      return NextResponse.json({ error: 'Erro ao processar cartão. Verifique os dados.' }, { status: 422 })
    }

    return NextResponse.json({ token: token.id, paymentMethodId, issuerId })
  } catch (err) {
    console.error('[tokenizar] ERRO:', JSON.stringify(err, null, 2))
    return NextResponse.json({ error: 'Erro ao processar cartão. Verifique os dados.' }, { status: 500 })
  }
}
