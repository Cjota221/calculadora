import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { randomUUID } from 'crypto'

export async function POST(req: NextRequest) {
  try {
    const { nome, email, telefone, senha } = await req.json()

    if (!nome || !email || !senha) {
      return NextResponse.json({ error: 'Campos obrigatórios: nome, email, senha.' }, { status: 400 })
    }
    if (senha.length < 8) {
      return NextResponse.json({ error: 'Senha deve ter pelo menos 8 caracteres.' }, { status: 400 })
    }

    // Verificar se email já existe
    const { data: existente } = await supabaseAdmin
      .from('usuarios_precifique')
      .select('id, status')
      .eq('email', email.toLowerCase().trim())
      .maybeSingle()

    if (existente?.status === 'ativo') {
      return NextResponse.json(
        { error: 'Esse email já tem acesso. Faça login.' },
        { status: 409 }
      )
    }

    // Se existe mas pendente — reutiliza (usuária tentando de novo)
    if (existente?.status === 'pendente') {
      const externalRef = `precifique_${existente.id}`
      return NextResponse.json({ userId: existente.id, externalRef })
    }

    // Criar user no Supabase Auth
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email.toLowerCase().trim(),
      password: senha,
      email_confirm: false,
    })

    if (authError) {
      console.error('Auth createUser error:', authError.message)
      if (authError.message.includes('already registered')) {
        return NextResponse.json({ error: 'Esse email já tem acesso. Faça login.' }, { status: 409 })
      }
      return NextResponse.json({ error: `Erro ao criar conta: ${authError.message}` }, { status: 500 })
    }

    const userId = randomUUID()
    const externalRef = `precifique_${userId}`

    const { error: dbError } = await supabaseAdmin
      .from('usuarios_precifique')
      .insert({
        id: userId,
        auth_user_id: authUser.user.id,
        nome: nome.trim(),
        email: email.toLowerCase().trim(),
        telefone: telefone?.trim() || null,
        status: 'pendente',
        mp_external_ref: externalRef,
      })

    if (dbError) {
      console.error('DB insert error:', dbError.message, dbError.code)
      await supabaseAdmin.auth.admin.deleteUser(authUser.user.id)
      return NextResponse.json({ error: `Erro ao salvar cadastro: ${dbError.message}` }, { status: 500 })
    }

    return NextResponse.json({ userId, externalRef })
  } catch {
    return NextResponse.json({ error: 'Erro interno. Tente novamente.' }, { status: 500 })
  }
}
