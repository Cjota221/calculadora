import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function GET(req: NextRequest) {
  const paymentId = req.nextUrl.searchParams.get('paymentId')
  const userId = req.nextUrl.searchParams.get('userId')

  // Exige os dois para cruzar — impede consulta avulsa
  if (!paymentId || !userId) {
    return NextResponse.json({ error: 'paymentId e userId são obrigatórios.' }, { status: 400 })
  }

  const { data } = await supabaseAdmin
    .from('usuarios_precifique')
    .select('status')
    .eq('id', userId)
    .eq('mp_payment_id', paymentId)
    .maybeSingle()

  // Retorna apenas o status — sem dados extras
  return NextResponse.json({ status: data?.status ?? 'pendente' })
}
