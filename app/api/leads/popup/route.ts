import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function POST(req: NextRequest) {
  const { name, phone, email } = await req.json()

  if (!name || !phone) {
    return NextResponse.json({ error: 'Dados incompletos' }, { status: 400 })
  }

  // Salva no banco
  await supabaseAdmin.from('leads_popup').insert({
    nome: name.trim(),
    telefone: phone.replace(/\D/g, ''),
  })

  // Encaminha pro n8n (WhatsApp) em background
  const n8nUrl = process.env.N8N_URL
  if (n8nUrl) {
    fetch(`${n8nUrl}/webhook/lead-cadastro`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, phone, email: email || '' }),
    }).catch(() => {})
  }

  return NextResponse.json({ success: true })
}
