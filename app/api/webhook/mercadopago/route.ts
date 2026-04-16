import { NextRequest, NextResponse } from 'next/server'
import { mpPayment } from '@/lib/mercadopago'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

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
