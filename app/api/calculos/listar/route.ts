import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function GET(req: NextRequest) {
  const usuario_id = req.nextUrl.searchParams.get('usuario_id')
  if (!usuario_id) return NextResponse.json({ error: 'usuario_id obrigatório' }, { status: 400 })

  const { data, error } = await supabaseAdmin
    .from('calculos_salvos')
    .select('id, nome, custo, frete, margem, preco_venda, lucro, data_venda, created_at')
    .eq('usuario_id', usuario_id)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
