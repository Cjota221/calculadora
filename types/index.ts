export interface DynamicRow {
  id: number
  label: string
  value: string
}

export type Tab = 'precificacao' | 'frete' | 'equilibrio' | 'guia'

export type MargemLevel = 'fraca' | 'ok' | 'boa' | 'otima'

export interface CalcResult {
  price: number
  base: number
  taxaAmt: number
  profit: number
  margin: number
  taxaPct: number
  margemLevel: MargemLevel
  margemLabel: string
  margemDesc: string
  margemPct: number
  markupDigitado?: number
}

export interface FreteResult {
  unit: number
  total: number
  qty: number
}

export interface EqResult {
  be: number
  contrib: number
  rev: number
  daily: number
  fixed: number
}

export interface PrecifiqueUser {
  id: string
  nome: string
  username: string
  whatsapp: string
  ativo: boolean
  created_at: string
  ultimo_acesso: string | null
  avatar_data?: string | null
}
