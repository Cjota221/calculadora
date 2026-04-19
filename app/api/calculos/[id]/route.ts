import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { searchParams } = new URL(req.url)
  const usuario_id = searchParams.get('usuario_id')

  if (!id || !usuario_id) {
    return NextResponse.json({ error: 'Parâmetros inválidos' }, { status: 400 })
  }

  const { error } = await supabaseAdmin
    .from('calculos_salvos')
    .delete()
    .eq('id', id)
    .eq('usuario_id', usuario_id)

  if (error) {
    console.error('[delete-calculo]', error)
    return NextResponse.json({ error: 'Erro ao apagar', detail: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await req.json()
  const { usuario_id, nome, custo, margem, preco_venda, lucro, data_venda } = body

  if (!id || !usuario_id) {
    return NextResponse.json({ error: 'Parâmetros inválidos' }, { status: 400 })
  }

  const { error } = await supabaseAdmin
    .from('calculos_salvos')
    .update({
      nome: nome?.trim() || null,
      custo,
      margem,
      preco_venda,
      lucro,
      data_venda: data_venda || null,
    })
    .eq('id', id)
    .eq('usuario_id', usuario_id)

  if (error) {
    console.error('[update-calculo]', error)
    return NextResponse.json({ error: 'Erro ao atualizar', detail: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
