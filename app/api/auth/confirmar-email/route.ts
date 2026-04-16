import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()
    if (!email) return NextResponse.json({ ok: false }, { status: 400 })

    const emailNorm = email.toLowerCase().trim()

    // Só confirma se a conta estiver ativa no banco
    const { data: usuario } = await supabaseAdmin
      .from('usuarios_precifique')
      .select('id, auth_user_id, status')
      .eq('email', emailNorm)
      .maybeSingle()

    if (!usuario || usuario.status !== 'ativo') {
      return NextResponse.json({ ok: false, motivo: 'pendente' })
    }

    // Buscar auth_user_id se estiver null
    let authUserId = usuario.auth_user_id
    if (!authUserId) {
      const { data: list } = await supabaseAdmin.auth.admin.listUsers()
      const found = list?.users?.find(u => u.email === emailNorm)
      if (found) {
        authUserId = found.id
        // Linkar
        await supabaseAdmin
          .from('usuarios_precifique')
          .update({ auth_user_id: found.id })
          .eq('id', usuario.id)
      }
    }

    if (!authUserId) return NextResponse.json({ ok: false, motivo: 'sem_auth' })

    // Confirmar email
    await supabaseAdmin.auth.admin.updateUserById(authUserId, {
      email_confirm: true,
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('confirmar-email error:', err)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
