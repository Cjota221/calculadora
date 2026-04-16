import { NextRequest, NextResponse } from 'next/server'
import { mpPayment } from '@/lib/mercadopago'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function POST(req: NextRequest) {
  try {
    const { userId, externalRef, email, metodo, cardToken, cpf, issuer, paymentMethodId } = await req.json()

    if (!userId || !externalRef || !email || !metodo) {
      return NextResponse.json({ error: 'Dados incompletos.' }, { status: 400 })
    }

    // Verificar que userId + externalRef realmente existem e pertencem juntos
    const { data: usuario, error: dbErr } = await supabaseAdmin
      .from('usuarios_precifique')
      .select('id, status')
      .eq('id', userId)
      .eq('mp_external_ref', externalRef)
      .maybeSingle()

    if (dbErr || !usuario) {
      return NextResponse.json({ error: 'Sessão de pagamento inválida.' }, { status: 403 })
    }

    if (usuario.status === 'ativo') {
      return NextResponse.json({ error: 'Esse acesso já está ativo. Faça login.' }, { status: 409 })
    }

    const baseBody: Record<string, unknown> = {
      transaction_amount: 24.99,
      description: 'Precifique — Acesso Vitalício',
      external_reference: externalRef,
      notification_url: `${process.env.NEXT_PUBLIC_URL}/api/webhook/mercadopago`,
      payer: { email },
    }

    if (metodo === 'pix') {
      baseBody.payment_method_id = 'pix'
    } else {
      if (!cardToken || !cpf || !paymentMethodId) {
        return NextResponse.json({ error: 'Token do cartão, bandeira e CPF são obrigatórios.' }, { status: 400 })
      }
      baseBody.token = cardToken
      baseBody.payment_method_id = paymentMethodId
      baseBody.installments = 1
      baseBody.issuer_id = issuer || undefined
      baseBody.payer = {
        email,
        identification: { type: 'CPF', number: cpf.replace(/\D/g, '') },
      }
    }

    const payment = await mpPayment.create({ body: baseBody as Parameters<typeof mpPayment.create>[0]['body'] })

    // Salvar payment_id no banco
    await supabaseAdmin
      .from('usuarios_precifique')
      .update({ mp_payment_id: String(payment.id) })
      .eq('id', userId)

    if (metodo === 'pix') {
      return NextResponse.json({
        tipo: 'pix',
        paymentId: payment.id,
        qrCode: payment.point_of_interaction?.transaction_data?.qr_code,
        qrCodeBase64: payment.point_of_interaction?.transaction_data?.qr_code_base64,
        status: payment.status,
      })
    }

    // Cartão
    if (payment.status === 'approved') {
      return NextResponse.json({ tipo: 'cartao', status: 'approved', paymentId: payment.id })
    }

    if (payment.status === 'rejected') {
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
      const motivo = payment.status_detail ? (motivos[payment.status_detail] ?? 'Cartão recusado pelo banco. Tente outro cartão.') : 'Cartão recusado pelo banco.'
      return NextResponse.json({ tipo: 'cartao', status: 'rejected', motivo }, { status: 422 })
    }

    return NextResponse.json({ tipo: 'cartao', status: payment.status, paymentId: payment.id })
  } catch (err) {
    console.error('processar-pagamento error:', err)
    return NextResponse.json({ error: 'Erro ao processar pagamento. Tente novamente.' }, { status: 500 })
  }
}
