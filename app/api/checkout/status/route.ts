import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function GET(req: NextRequest) {
  const paymentId = req.nextUrl.searchParams.get('paymentId')
  const userId = req.nextUrl.searchParams.get('userId')

  if (!paymentId && !userId) {
    return NextResponse.json({ error: 'paymentId ou userId obrigatório.' }, { status: 400 })
  }

  const query = supabaseAdmin
    .from('usuarios_precifique')
    .select('status, ativado_em')

  if (paymentId) query.eq('mp_payment_id', paymentId)
  else if (userId) query.eq('id', userId)

  const { data } = await query.maybeSingle()

  return NextResponse.json({ status: data?.status ?? 'pendente' })
}
