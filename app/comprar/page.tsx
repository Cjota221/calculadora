'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

const WPP = `https://wa.me/5562982237075?text=${encodeURIComponent('Olá! Já paguei o Precifique e preciso de ajuda com meu acesso.')}`
const MP_PK = process.env.NEXT_PUBLIC_MP_PUBLIC_KEY!

type Metodo = 'pix' | 'cartao'
type Etapa = 'form' | 'pix-aguardando' | 'sucesso'

interface CardData {
  numero: string
  nome: string
  validade: string
  cvv: string
  cpf: string
}

function formatCartao(v: string) { return v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim() }
function formatValidade(v: string) { return v.replace(/\D/g, '').slice(0, 4).replace(/^(\d{2})(\d)/, '$1/$2') }
function formatCpf(v: string) { return v.replace(/\D/g, '').slice(0, 11).replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, '$1.$2.$3-$4') }

export default function ComprarPage() {
  const router = useRouter()
  const [etapa, setEtapa] = useState<Etapa>('form')
  const [metodo, setMetodo] = useState<Metodo>('pix')
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')

  // Dados cadastro
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [telefone, setTelefone] = useState('')
  const [senha, setSenha] = useState('')
  const [senhaConf, setSenhaConf] = useState('')

  // Cartão
  const [card, setCard] = useState<CardData>({ numero: '', nome: '', validade: '', cvv: '', cpf: '' })

  // Pix
  const [qrCode, setQrCode] = useState('')
  const [qrBase64, setQrBase64] = useState('')
  const [paymentId, setPaymentId] = useState('')
  const [userId, setUserId] = useState('')
  const [copiado, setCopiado] = useState(false)
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    // Carregar SDK do MP
    const script = document.createElement('script')
    script.src = 'https://sdk.mercadopago.com/v2/mercadopago.js'
    script.async = true
    document.head.appendChild(script)
    return () => { document.head.removeChild(script) }
  }, [])

  useEffect(() => {
    return () => { if (pollingRef.current) clearInterval(pollingRef.current) }
  }, [])

  function validar() {
    if (!nome.trim()) return 'Informe seu nome completo.'
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Email inválido.'
    if (senha.length < 8) return 'Senha deve ter pelo menos 8 caracteres.'
    if (senha !== senhaConf) return 'As senhas não coincidem.'
    if (metodo === 'cartao') {
      if (card.numero.replace(/\s/g, '').length < 15) return 'Número do cartão inválido.'
      if (!card.nome.trim()) return 'Informe o nome impresso no cartão.'
      if (card.validade.length < 5) return 'Validade inválida.'
      if (card.cvv.length < 3) return 'CVV inválido.'
      if (card.cpf.replace(/\D/g, '').length < 11) return 'CPF inválido.'
    }
    return ''
  }

  async function tokenizarCartao(): Promise<{ token: string; issuer: string } | null> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mp = (window as any).MercadoPago
    if (!mp) { setErro('SDK do MP não carregou. Recarregue a página.'); return null }
    const mpInstance = new mp(MP_PK, { locale: 'pt-BR' })
    const [mes, ano] = card.validade.split('/')
    try {
      const result = await mpInstance.createCardToken({
        cardNumber: card.numero.replace(/\s/g, ''),
        cardholderName: card.nome,
        cardExpirationMonth: mes,
        cardExpirationYear: `20${ano}`,
        securityCode: card.cvv,
        identificationType: 'CPF',
        identificationNumber: card.cpf.replace(/\D/g, ''),
      })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return { token: (result as any).id, issuer: (result as any).issuer?.id }
    } catch {
      setErro('Erro ao processar cartão. Verifique os dados.')
      return null
    }
  }

  function iniciarPolling(pid: string, uid: string) {
    let tentativas = 0
    pollingRef.current = setInterval(async () => {
      tentativas++
      if (tentativas > 360) { // 30min
        clearInterval(pollingRef.current!)
        setErro('Pix expirado. Gere um novo pagamento.')
        setEtapa('form')
        return
      }
      try {
        const res = await fetch(`/api/checkout/status?paymentId=${pid}&userId=${uid}`)
        const data = await res.json()
        if (data.status === 'ativo') {
          clearInterval(pollingRef.current!)
          setEtapa('sucesso')
          setTimeout(() => router.replace('/login?welcome=true'), 2000)
        }
      } catch { /* continua */ }
    }, 5000)
  }

  async function pagar() {
    const err = validar()
    if (err) { setErro(err); return }
    setErro(''); setLoading(true)

    try {
      // 1. Criar usuária
      const resUser = await fetch('/api/checkout/criar-usuario', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, email, telefone, senha }),
      })
      const dataUser = await resUser.json()
      if (!resUser.ok) { setErro(dataUser.error || 'Erro ao criar conta.'); setLoading(false); return }

      const { userId: uid, externalRef } = dataUser
      setUserId(uid)

      // 2. Tokenizar cartão se necessário
      let cardToken: string | undefined
      let issuer: string | undefined
      if (metodo === 'cartao') {
        const tokenData = await tokenizarCartao()
        if (!tokenData) { setLoading(false); return }
        cardToken = tokenData.token
        issuer = tokenData.issuer
      }

      // 3. Processar pagamento
      const resPag = await fetch('/api/checkout/processar-pagamento', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: uid, externalRef, email, metodo, cardToken, cpf: card.cpf, issuer }),
      })
      const dataPag = await resPag.json()

      if (!resPag.ok) { setErro(dataPag.error || dataPag.motivo || 'Pagamento recusado.'); setLoading(false); return }

      if (metodo === 'pix') {
        setQrCode(dataPag.qrCode || '')
        setQrBase64(dataPag.qrCodeBase64 || '')
        setPaymentId(String(dataPag.paymentId))
        setEtapa('pix-aguardando')
        iniciarPolling(String(dataPag.paymentId), uid)
      } else {
        if (dataPag.status === 'approved') {
          setEtapa('sucesso')
          setTimeout(() => router.replace('/login?welcome=true'), 2000)
        } else {
          setErro(dataPag.motivo || 'Pagamento pendente. Aguarde ou tente novamente.')
        }
      }
    } catch {
      setErro('Erro de conexão. Verifique sua internet e tente novamente.')
    }
    setLoading(false)
  }

  function copiarPix() {
    navigator.clipboard.writeText(qrCode).then(() => {
      setCopiado(true)
      setTimeout(() => setCopiado(false), 3000)
    })
  }

  // ── Tela de sucesso
  if (etapa === 'sucesso') {
    return (
      <div className="buy-wrap">
        <div className="buy-card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
          <h2 style={{ fontFamily: 'var(--font-d)', fontSize: '1.6rem', marginBottom: '0.5rem', color: 'var(--pink)' }}>Acesso ativado!</h2>
          <p style={{ color: 'var(--text2)', fontSize: 'var(--fs-sm)' }}>Redirecionando para o login…</p>
        </div>
      </div>
    )
  }

  // ── Tela Pix aguardando
  if (etapa === 'pix-aguardando') {
    return (
      <div className="buy-wrap">
        <div className="buy-card">
          <div className="buy-brand"><span>Precifique</span><span style={{ color: 'var(--pink)' }}>.</span></div>
          <h2 className="buy-title">Pague via Pix</h2>
          <p className="buy-sub">Escaneie o QR Code ou copie o código. O acesso é liberado automaticamente após a confirmação.</p>

          {qrBase64 && (
            <div style={{ textAlign: 'center', margin: '1.5rem 0' }}>
              <Image src={`data:image/png;base64,${qrBase64}`} alt="QR Code Pix" width={200} height={200} style={{ borderRadius: 12, border: '2px solid var(--border)' }} />
            </div>
          )}

          {qrCode && (
            <div className="pix-code-wrap">
              <p className="pix-code">{qrCode.slice(0, 40)}…</p>
              <button className="btn-copy" onClick={copiarPix}>
                {copiado ? '✓ Copiado!' : 'Copiar código'}
              </button>
            </div>
          )}

          <div className="pix-status">
            <span className="pix-dot" />
            Aguardando pagamento…
          </div>

          <p className="buy-note">Pix expira em 30 minutos. Não feche essa página.</p>
          <a href={WPP} target="_blank" rel="noreferrer" className="buy-wpp">Já paguei mas não ativou — falar no WhatsApp</a>
        </div>
      </div>
    )
  }

  // ── Formulário principal
  return (
    <div className="buy-wrap">
      <div className="buy-card">
        <div className="buy-brand"><span>Precifique</span><span style={{ color: 'var(--pink)' }}>.</span></div>
        <h2 className="buy-title">Garanta seu acesso</h2>
        <p className="buy-sub">Paga uma vez · Acesso para sempre · <strong style={{ color: 'var(--pink)' }}>R$ 24,99</strong></p>

        {/* Cadastro */}
        <div className="buy-section-label">Seus dados</div>
        <div className="buy-field">
          <label>Nome completo</label>
          <input type="text" placeholder="Seu nome" value={nome} onChange={e => setNome(e.target.value)} autoComplete="name" />
        </div>
        <div className="buy-field">
          <label>Email</label>
          <input type="email" placeholder="seu@email.com" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" />
        </div>
        <div className="buy-field">
          <label>WhatsApp <span className="optional">(opcional)</span></label>
          <input type="tel" placeholder="(62) 9 9999-9999" value={telefone} onChange={e => setTelefone(e.target.value)} autoComplete="tel" />
        </div>
        <div className="buy-field-row">
          <div className="buy-field">
            <label>Crie sua senha</label>
            <input type="password" placeholder="Mínimo 8 caracteres" value={senha} onChange={e => setSenha(e.target.value)} autoComplete="new-password" />
          </div>
          <div className="buy-field">
            <label>Confirme a senha</label>
            <input type="password" placeholder="Repita a senha" value={senhaConf} onChange={e => setSenhaConf(e.target.value)} autoComplete="new-password" />
          </div>
        </div>

        {/* Método */}
        <div className="buy-section-label">Forma de pagamento</div>
        <div className="metodo-wrap">
          <button className={`metodo-btn${metodo === 'pix' ? ' active' : ''}`} onClick={() => setMetodo('pix')}>
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
              <line x1="14" y1="14" x2="14" y2="14"/><line x1="17" y1="14" x2="17" y2="14"/>
              <line x1="20" y1="14" x2="20" y2="14"/><line x1="14" y1="17" x2="14" y2="17"/>
              <line x1="17" y1="17" x2="20" y2="20"/>
            </svg>
            Pix
          </button>
          <button className={`metodo-btn${metodo === 'cartao' ? ' active' : ''}`} onClick={() => setMetodo('cartao')}>
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>
            </svg>
            Cartão
          </button>
        </div>

        {/* Campos cartão */}
        {metodo === 'cartao' && (
          <div className="cartao-fields">
            <div className="buy-field">
              <label>Número do cartão</label>
              <input type="text" inputMode="numeric" placeholder="0000 0000 0000 0000" value={card.numero}
                onChange={e => setCard(c => ({ ...c, numero: formatCartao(e.target.value) }))} autoComplete="cc-number" />
            </div>
            <div className="buy-field">
              <label>Nome impresso no cartão</label>
              <input type="text" placeholder="NOME SOBRENOME" value={card.nome}
                onChange={e => setCard(c => ({ ...c, nome: e.target.value.toUpperCase() }))} autoComplete="cc-name" />
            </div>
            <div className="buy-field-row">
              <div className="buy-field">
                <label>Validade</label>
                <input type="text" inputMode="numeric" placeholder="MM/AA" value={card.validade}
                  onChange={e => setCard(c => ({ ...c, validade: formatValidade(e.target.value) }))} autoComplete="cc-exp" />
              </div>
              <div className="buy-field">
                <label>CVV</label>
                <input type="text" inputMode="numeric" placeholder="123" maxLength={4} value={card.cvv}
                  onChange={e => setCard(c => ({ ...c, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) }))} autoComplete="cc-csc" />
              </div>
            </div>
            <div className="buy-field">
              <label>CPF do titular</label>
              <input type="text" inputMode="numeric" placeholder="000.000.000-00" value={card.cpf}
                onChange={e => setCard(c => ({ ...c, cpf: formatCpf(e.target.value) }))} />
            </div>
          </div>
        )}

        {erro && <div className="buy-error">{erro}</div>}

        <button className="btn-pagar" onClick={pagar} disabled={loading}>
          {loading
            ? <span className="spinner" />
            : metodo === 'pix' ? 'Gerar Pix — R$ 24,99' : 'Pagar R$ 24,99 no cartão'}
        </button>

        <div className="buy-seguro">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
          Pagamento seguro via Mercado Pago
        </div>

        <a href={WPP} target="_blank" rel="noreferrer" className="buy-wpp">Prefiro pagar pelo WhatsApp</a>
      </div>

      <style>{`
        .buy-wrap{min-height:100vh;display:flex;align-items:flex-start;justify-content:center;padding:2rem 1rem 5rem;background:linear-gradient(135deg,#0D0428 0%,#2A0A70 60%,#7C3AED 100%)}
        .buy-card{width:100%;max-width:480px;background:#fff;border-radius:var(--radius);padding:2rem 1.75rem;box-shadow:0 24px 80px rgba(0,0,0,0.35)}
        .buy-brand{font-family:var(--font-d);font-size:1.5rem;font-weight:800;color:var(--text);margin-bottom:1.5rem;text-align:center}
        .buy-title{font-family:var(--font-d);font-size:1.4rem;font-weight:800;color:var(--text);margin-bottom:0.35rem;text-align:center}
        .buy-sub{font-size:var(--fs-sm);color:var(--text3);text-align:center;margin-bottom:1.75rem;line-height:1.6}
        .buy-section-label{font-size:var(--fs-xs);font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:var(--text3);margin:1.5rem 0 0.85rem;padding-top:1.25rem;border-top:1px solid var(--border)}
        .buy-section-label:first-of-type{border-top:none;padding-top:0;margin-top:0}
        .buy-field{margin-bottom:0.85rem}
        .buy-field label{display:block;font-size:var(--fs-xs);font-weight:700;text-transform:uppercase;letter-spacing:0.07em;color:var(--text3);margin-bottom:0.4rem}
        .buy-field .optional{font-weight:400;text-transform:none;letter-spacing:0}
        .buy-field input{width:100%;padding:0.85rem 1rem;background:var(--bg3);border:1.5px solid var(--border);border-radius:var(--radius-sm);font-family:var(--font-s);font-size:1rem;color:var(--text);outline:none;transition:border-color 0.2s,box-shadow 0.2s}
        .buy-field input:focus{border-color:rgba(124,58,237,0.4);box-shadow:0 0 0 3px rgba(124,58,237,0.07);background:#fff}
        .buy-field input::placeholder{color:var(--text3);font-weight:400}
        .buy-field-row{display:grid;grid-template-columns:1fr 1fr;gap:0.75rem}
        .metodo-wrap{display:grid;grid-template-columns:1fr 1fr;gap:0.75rem;margin-bottom:1.25rem}
        .metodo-btn{display:flex;align-items:center;justify-content:center;gap:0.5rem;padding:0.85rem;border:1.5px solid var(--border);border-radius:var(--radius-sm);background:#fff;font-family:var(--font-s);font-size:var(--fs-sm);font-weight:600;color:var(--text2);cursor:pointer;transition:all 0.2s}
        .metodo-btn:hover{border-color:var(--pink);color:var(--pink)}
        .metodo-btn.active{border-color:var(--pink);background:var(--pink-dim);color:var(--pink)}
        .cartao-fields{animation:fadeUp 0.2s var(--ease)}
        .btn-pagar{width:100%;padding:1.1rem;margin-top:1rem;background:var(--pink);color:#fff;border:none;border-radius:var(--radius-sm);font-family:var(--font-s);font-size:1rem;font-weight:800;cursor:pointer;transition:all 0.2s var(--ease);box-shadow:0 4px 18px rgba(124,58,237,0.3);display:flex;align-items:center;justify-content:center;gap:0.5rem}
        .btn-pagar:hover:not(:disabled){background:var(--pink2);transform:translateY(-1px);box-shadow:0 6px 24px rgba(124,58,237,0.4)}
        .btn-pagar:disabled{opacity:0.6;cursor:not-allowed}
        .buy-seguro{display:flex;align-items:center;justify-content:center;gap:0.4rem;font-size:var(--fs-xs);color:var(--text3);margin-top:0.85rem}
        .buy-error{background:var(--red-dim);border:1px solid rgba(217,53,53,0.2);border-radius:10px;padding:0.75rem 1rem;font-size:var(--fs-sm);color:var(--red);margin-top:0.75rem;font-weight:500}
        .buy-wpp{display:block;text-align:center;font-size:var(--fs-xs);color:var(--text3);margin-top:1rem;text-decoration:underline;text-underline-offset:3px;transition:color 0.2s}
        .buy-wpp:hover{color:var(--pink)}
        .buy-note{font-size:var(--fs-xs);color:var(--text3);text-align:center;margin-top:0.5rem;line-height:1.5}
        .pix-code-wrap{background:var(--bg3);border:1px solid var(--border);border-radius:var(--radius-sm);padding:1rem;margin:1rem 0}
        .pix-code{font-size:var(--fs-xs);color:var(--text3);word-break:break-all;margin-bottom:0.75rem;line-height:1.5}
        .btn-copy{width:100%;padding:0.75rem;background:var(--pink);color:#fff;border:none;border-radius:var(--radius-xs);font-family:var(--font-s);font-size:var(--fs-sm);font-weight:700;cursor:pointer;transition:background 0.2s}
        .btn-copy:hover{background:var(--pink2)}
        .pix-status{display:flex;align-items:center;gap:0.5rem;font-size:var(--fs-sm);font-weight:600;color:var(--text2);margin:1rem 0}
        .pix-dot{width:10px;height:10px;background:#25D366;border-radius:50%;animation:pulse 1.5s ease infinite;flex-shrink:0}
        .spinner{width:18px;height:18px;border:2px solid rgba(255,255,255,0.4);border-top-color:#fff;border-radius:50%;animation:spin 0.7s linear infinite}
      `}</style>
    </div>
  )
}
