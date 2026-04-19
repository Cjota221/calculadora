import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id obrigatório' }, { status: 400 })

  const { data: afiliado, error } = await supabaseAdmin
    .from('afiliados')
    .select('id, nome, email, codigo_afiliado, chave_pix, tipo_pix, total_vendas, total_ganho, created_at')
    .eq('id', id)
    .single()

  if (error || !afiliado) return NextResponse.json({ error: 'Afiliado não encontrado.' }, { status: 404 })

  const { data: comissoes } = await supabaseAdmin
    .from('comissoes')
    .select('id, comprador_email, valor_venda, valor_comissao, status, pago_em, created_at')
    .eq('afiliado_id', id)
    .order('created_at', { ascending: false })
    .limit(100)

  return NextResponse.json({ afiliado, comissoes: comissoes || [] })
}
