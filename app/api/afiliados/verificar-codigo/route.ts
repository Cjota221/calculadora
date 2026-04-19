import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function GET(req: NextRequest) {
  const codigo = req.nextUrl.searchParams.get('codigo')?.toLowerCase().replace(/[^a-z0-9]/g, '') ?? ''

  if (codigo.length < 3) {
    return NextResponse.json({ available: false, sugestao: null })
  }

  const { data } = await supabaseAdmin
    .from('afiliados')
    .select('id')
    .eq('codigo_afiliado', codigo)
    .maybeSingle()

  if (!data) return NextResponse.json({ available: true })

  // encontra próximo sufixo disponível
  for (let i = 2; i <= 99; i++) {
    const candidato = `${codigo}${String(i).padStart(2, '0')}`
    const { data: existe } = await supabaseAdmin
      .from('afiliados')
      .select('id')
      .eq('codigo_afiliado', candidato)
      .maybeSingle()
    if (!existe) return NextResponse.json({ available: false, sugestao: candidato })
  }

  return NextResponse.json({ available: false, sugestao: null })
}
