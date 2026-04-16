import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

const PRECO = 24.99

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('usuarios_precifique')
    .select('status, created_at, ativado_em')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const agora = new Date()
  const hoje = agora.toISOString().slice(0, 10)
  const inicioMes = `${agora.getFullYear()}-${String(agora.getMonth() + 1).padStart(2, '0')}-01`
  const inicioSemana = new Date(agora)
  inicioSemana.setDate(agora.getDate() - agora.getDay())
  const inicioSemanaStr = inicioSemana.toISOString().slice(0, 10)

  const total = data.length
  const ativos = data.filter(u => u.status === 'ativo').length
  const pendentes = data.filter(u => u.status === 'pendente').length
  const faturamento = ativos * PRECO

  const novosHoje = data.filter(u => u.created_at?.slice(0, 10) === hoje).length
  const novosSemana = data.filter(u => u.created_at?.slice(0, 10) >= inicioSemanaStr).length
  const novosMes = data.filter(u => u.created_at?.slice(0, 10) >= inicioMes).length
  const faturamentoMes = data.filter(u =>
    u.status === 'ativo' && u.ativado_em?.slice(0, 10) >= inicioMes
  ).length * PRECO

  return NextResponse.json({
    total,
    ativos,
    pendentes,
    faturamento,
    novosHoje,
    novosSemana,
    novosMes,
    faturamentoMes,
  })
}
