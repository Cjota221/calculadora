import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { randomUUID } from 'crypto'

export async function POST(req: NextRequest) {
  try {
    const { nome, email, telefone, nicho, senha } = await req.json()

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
      email_confirm: true,
    })

    if (authError) {
      console.error('Auth createUser error:', authError.message)
      const jaExiste = authError.message.toLowerCase().includes('already') || authError.message.toLowerCase().includes('registered')

      if (jaExiste) {
        // Email já existe no Auth — buscar o auth_user_id real
        const { data: authList } = await supabaseAdmin.auth.admin.listUsers()
        const authUserExistente = authList?.users?.find(u => u.email === email.toLowerCase().trim())

        // Atualizar a senha para a nova que a pessoa digitou
        if (authUserExistente) {
          await supabaseAdmin.auth.admin.updateUserById(authUserExistente.id, {
            password: senha,
            email_confirm: true,
          })
        }

        const { data: noDb } = await supabaseAdmin
          .from('usuarios_precifique')
          .select('id, status')
          .eq('email', email.toLowerCase().trim())
          .maybeSingle()

        if (noDb?.status === 'ativo') {
          return NextResponse.json({ error: 'Esse email já tem acesso. Faça login.' }, { status: 409 })
        }
        if (noDb?.status === 'pendente') {
          // Aproveita para linkar o auth_user_id se ainda estava null
          if (authUserExistente && !noDb) {
            await supabaseAdmin.from('usuarios_precifique')
              .update({ auth_user_id: authUserExistente.id })
              .eq('email', email.toLowerCase().trim())
              .is('auth_user_id', null)
          }
          return NextResponse.json({ userId: noDb.id, externalRef: `precifique_${noDb.id}` })
        }

        // Não tem no banco — cria com auth_user_id correto
        const userId = randomUUID()
        const externalRef = `precifique_${userId}`
        const { error: insertErr } = await supabaseAdmin.from('usuarios_precifique').insert({
          id: userId,
          auth_user_id: authUserExistente?.id ?? null,
          nome: nome.trim(),
          email: email.toLowerCase().trim(),
          telefone: telefone?.trim() || null,
          nicho: nicho?.trim() || null,
          status: 'pendente',
          mp_external_ref: externalRef,
        })
        if (insertErr) {
          console.error('Insert recovery error:', insertErr.message)
          return NextResponse.json({ error: 'Erro ao processar cadastro. Tente novamente.' }, { status: 500 })
        }
        return NextResponse.json({ userId, externalRef })
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
        nicho: nicho?.trim() || null,
        status: 'pendente',
        mp_external_ref: externalRef,
      })

    if (dbError) {
      console.error('DB insert error:', dbError.message, dbError.code)
      await supabaseAdmin.auth.admin.deleteUser(authUser.user.id)
      return NextResponse.json({ error: `Erro ao salvar cadastro: ${dbError.message}` }, { status: 500 })
    }

    // Disparar lead_cadastro no n8n (fire-and-forget)
    fetch(`${process.env.N8N_URL}/webhook/lead-cadastro`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: nome.trim(),
        email: email.toLowerCase().trim(),
        phone: telefone?.trim() || '',
      }),
    }).catch(() => {})

    return NextResponse.json({ userId, externalRef })
  } catch {
    return NextResponse.json({ error: 'Erro interno. Tente novamente.' }, { status: 500 })
  }
}
