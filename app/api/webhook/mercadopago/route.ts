import { NextRequest, NextResponse } from 'next/server'
import { createHmac } from 'crypto'
import { mpPayment } from '@/lib/mercadopago'
import { supabaseAdmin } from '@/lib/supabase-admin'

function verificarAssinatura(req: NextRequest, rawBody: string): boolean {
  const secret = process.env.MP_WEBHOOK_SECRET
  if (!secret) return true // sem secret configurado, deixa passar

  const xSignature = req.headers.get('x-signature') || ''
  const xRequestId = req.headers.get('x-request-id') || ''
  const dataId = req.nextUrl.searchParams.get('data.id') || ''

  // Extrair ts e v1 do header x-signature
  const parts = Object.fromEntries(xSignature.split(',').map(p => p.split('=')))
  const ts = parts['ts']
  const v1 = parts['v1']
  if (!ts || !v1) return false

  // Montar o template de assinatura conforme documentação do MP
  const template = `id:${dataId};request-id:${xRequestId};ts:${ts};`
  const hmac = createHmac('sha256', secret).update(template).digest('hex')

  return hmac === v1
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text()

    // Verificar assinatura
    if (!verificarAssinatura(req, rawBody)) {
      console.warn('Webhook MP: assinatura inválida')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = JSON.parse(rawBody)

    // MP envia tipo 'payment' para pagamentos
    if (body.type !== 'payment') {
      return NextResponse.json({ ok: true })
    }

    const paymentId = String(body.data?.id)
    if (!paymentId) return NextResponse.json({ ok: true })

    // Buscar detalhes do pagamento na API do MP
    const payment = await mpPayment.get({ id: Number(paymentId) })

    if (payment.status !== 'approved') {
      return NextResponse.json({ ok: true })
    }

    const externalRef = payment.external_reference

    // REGRA 1: Idempotência — já foi ativado?
    const { data: jaAtivo } = await supabaseAdmin
      .from('usuarios_precifique')
      .select('id, status')
      .eq('mp_payment_id', paymentId)
      .eq('status', 'ativo')
      .maybeSingle()

    if (jaAtivo) return NextResponse.json({ ok: true })

    // REGRA 2: Buscar usuária por external_ref OU payment_id
    const { data: usuario } = await supabaseAdmin
      .from('usuarios_precifique')
      .select('id, auth_user_id, status')
      .or(`mp_external_ref.eq.${externalRef},mp_payment_id.eq.${paymentId}`)
      .maybeSingle()

    if (!usuario) {
      console.error('Webhook MP: usuária não encontrada para payment', paymentId, externalRef)
      return NextResponse.json({ ok: true })
    }

    // REGRA 3: Guard atômico — só atualiza se ainda pendente
    const { data: atualizado } = await supabaseAdmin
      .from('usuarios_precifique')
      .update({
        status: 'ativo',
        ativado_em: new Date().toISOString(),
        mp_payment_id: paymentId,
      })
      .eq('id', usuario.id)
      .eq('status', 'pendente')
      .select()
      .maybeSingle()

    if (!atualizado) {
      // Race condition — outro processo já ativou
      return NextResponse.json({ ok: true })
    }

    // REGRA 4: Confirmar email no Supabase Auth
    if (usuario.auth_user_id) {
      await supabaseAdmin.auth.admin.updateUserById(usuario.auth_user_id, {
        email_confirm: true,
      })
    }

    console.log('✅ Conta ativada:', usuario.id, 'payment:', paymentId)
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Webhook MP erro:', err)
    // Retornar 200 para MP não retentar
    return NextResponse.json({ ok: true })
  }
}

// MP faz GET para verificar se o endpoint existe
export async function GET() {
  return NextResponse.json({ ok: true })
}
