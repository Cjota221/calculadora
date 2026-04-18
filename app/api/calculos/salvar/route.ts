import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { usuario_id, nome, custo, frete, despesas, taxas, margem, preco_venda, lucro, data_venda } = body

  if (!usuario_id || !custo || !margem || !preco_venda) {
    return NextResponse.json({ error: 'Dados incompletos' }, { status: 400 })
  }

  const { error } = await supabaseAdmin.from('calculos_salvos').insert({
    usuario_id,
    nome: nome?.trim() || null,
    custo,
    frete: frete ?? 0,
    despesas: despesas ?? [],
    taxas: taxas ?? [],
    margem,
    preco_venda,
    lucro,
    data_venda: data_venda || null,
  })

  if (error) {
    console.error('[salvar-calculo] erro:', error)
    return NextResponse.json(
      { error: 'Erro ao salvar', detail: error.message, code: error.code },
      { status: 500 }
    )
  }

  return NextResponse.json({ success: true })
}
