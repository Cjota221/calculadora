import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

async function sha256(text: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
}

export async function POST(req: NextRequest) {
  try {
    const { email, senha } = await req.json()
    if (!email || !senha) return NextResponse.json({ error: 'Email e senha obrigatórios.' }, { status: 400 })

    const senhaHash = await sha256(senha)

    const { data, error } = await supabaseAdmin
      .from('afiliados')
      .select('id, nome, email, codigo_afiliado, ativo')
      .eq('email', email.toLowerCase().trim())
      .eq('senha_hash', senhaHash)
      .maybeSingle()

    if (error || !data) return NextResponse.json({ error: 'Email ou senha incorretos.' }, { status: 401 })
    if (!data.ativo) return NextResponse.json({ error: 'Conta desativada. Entre em contato.' }, { status: 403 })

    return NextResponse.json({ afiliado: { id: data.id, nome: data.nome, email: data.email, codigo_afiliado: data.codigo_afiliado } })
  } catch {
    return NextResponse.json({ error: 'Erro interno.' }, { status: 500 })
  }
}
