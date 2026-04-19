import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function POST(req: NextRequest) {
  const { afiliado_id } = await req.json()
  if (!afiliado_id) return NextResponse.json({ error: 'afiliado_id obrigatório' }, { status: 400 })

  const { error } = await supabaseAdmin
    .from('comissoes')
    .update({ status: 'pago', pago_em: new Date().toISOString() })
    .eq('afiliado_id', afiliado_id)
    .eq('status', 'pendente')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
