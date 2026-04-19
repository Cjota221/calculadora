import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function GET() {
  const { data: afiliados, error } = await supabaseAdmin
    .from('afiliados')
    .select('id, nome, email, codigo_afiliado, chave_pix, tipo_pix, total_vendas, total_ganho, ativo, created_at')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Para cada afiliado, buscar valor pendente
  const ids = (afiliados || []).map(a => a.id)
  let pendentes: { afiliado_id: string; valor_comissao: number }[] = []

  if (ids.length > 0) {
    const { data } = await supabaseAdmin
      .from('comissoes')
      .select('afiliado_id, valor_comissao')
      .eq('status', 'pendente')
      .in('afiliado_id', ids)
    pendentes = data || []
  }

  const pendentesPorAfiliado: Record<string, number> = {}
  for (const p of pendentes) {
    pendentesPorAfiliado[p.afiliado_id] = (pendentesPorAfiliado[p.afiliado_id] || 0) + p.valor_comissao
  }

  const result = (afiliados || []).map(a => ({
    ...a,
    a_pagar: pendentesPorAfiliado[a.id] || 0,
  }))

  return NextResponse.json(result)
}
