import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

async function sha256(text: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
}

export async function POST(req: NextRequest) {
  try {
    const { nome, email, senha, whatsapp, chave_pix, tipo_pix, codigo_afiliado } = await req.json()

    if (!nome || !email || !senha || !whatsapp || !chave_pix || !codigo_afiliado) {
      return NextResponse.json({ error: 'Preencha todos os campos obrigatórios.' }, { status: 400 })
    }
    if (senha.length < 6) {
      return NextResponse.json({ error: 'Senha deve ter pelo menos 6 caracteres.' }, { status: 400 })
    }

    const codigo = codigo_afiliado.toLowerCase().replace(/[^a-z0-9]/g, '')
    if (codigo.length < 3) {
      return NextResponse.json({ error: 'Código deve ter pelo menos 3 caracteres (letras e números).' }, { status: 400 })
    }

    const { data: emailExiste } = await supabaseAdmin
      .from('afiliados').select('id').eq('email', email.toLowerCase()).maybeSingle()
    if (emailExiste) return NextResponse.json({ error: 'Email já cadastrado.' }, { status: 409 })

    const { data: codigoExiste } = await supabaseAdmin
      .from('afiliados').select('id').eq('codigo_afiliado', codigo).maybeSingle()
    if (codigoExiste) return NextResponse.json({ error: 'Código já em uso, escolha outro.' }, { status: 409 })

    const senhaHash = await sha256(senha)

    const { data, error } = await supabaseAdmin
      .from('afiliados')
      .insert({ nome: nome.trim(), email: email.toLowerCase().trim(), senha_hash: senhaHash, whatsapp, chave_pix, tipo_pix: tipo_pix || 'cpf', codigo_afiliado: codigo })
      .select('id, nome, email, codigo_afiliado')
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ afiliado: data })
  } catch {
    return NextResponse.json({ error: 'Erro interno.' }, { status: 500 })
  }
}
