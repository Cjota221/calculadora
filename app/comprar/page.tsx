'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { ga } from '@/lib/gtag'
import '@/styles/checkout.css'

const WPP = `https://wa.me/5562982237075?text=${encodeURIComponent('Olá! Já paguei o Precifique e preciso de ajuda com meu acesso.')}`

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
function luhn(num: string) {
  const d = num.replace(/\D/g, '')
  let s = 0; let odd = false
  for (let i = d.length - 1; i >= 0; i--) {
    let n = parseInt(d[i])
    if (odd) { n *= 2; if (n > 9) n -= 9 }
    s += n; odd = !odd
  }
  return s % 10 === 0
}

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
  const [nicho, setNicho] = useState('')
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
    ga.verPagina()
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
      const numLimpoVal = card.numero.replace(/\s/g, '')
      if (numLimpoVal.length < 15) return 'Número do cartão inválido.'
      if (!luhn(numLimpoVal)) return 'Número do cartão inválido. Verifique os dígitos.'
      if (!card.nome.trim()) return 'Informe o nome impresso no cartão.'
      if (card.validade.length < 5) return 'Validade inválida.'
      if (card.cvv.length < 3) return 'CVV inválido.'
      if (card.cpf.replace(/\D/g, '').length < 11) return 'CPF inválido.'
    }
    return ''
  }

  async function tokenizarCartao(): Promise<{ token: string; issuer: string; paymentMethodId: string } | null> {
    const [mes, ano] = card.validade.split('/')
    try {
      const res = await fetch('/api/checkout/tokenizar-cartao', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cardNumber: card.numero,
          cardholderName: card.nome,
          expirationMonth: mes,
          expirationYear: ano,
          securityCode: card.cvv,
          cpf: card.cpf,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setErro(data.error || 'Erro ao processar cartão.'); return null }
      return { token: data.token, issuer: data.issuerId, paymentMethodId: data.paymentMethodId }
    } catch {
      setErro('Erro ao processar cartão. Verifique sua conexão.')
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
          ga.compraConfirmada(paymentId)
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
    ga.iniciarCheckout()

    try {
      // 1. Criar usuária
      const resUser = await fetch('/api/checkout/criar-usuario', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, email, telefone, nicho, senha }),
      })
      const dataUser = await resUser.json()
      if (!resUser.ok) { setErro(dataUser.error || 'Erro ao criar conta.'); setLoading(false); return }

      const { userId: uid, externalRef } = dataUser
      setUserId(uid)

      // 2. Tokenizar cartão se necessário
      let cardToken: string | undefined
      let issuer: string | undefined
      let paymentMethodId: string | undefined
      if (metodo === 'cartao') {
        const tokenData = await tokenizarCartao()
        if (!tokenData) { setLoading(false); return }
        cardToken = tokenData.token
        issuer = tokenData.issuer
        paymentMethodId = tokenData.paymentMethodId
      }

      // 3. Processar pagamento
      const resPag = await fetch('/api/checkout/processar-pagamento', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: uid, externalRef, email, metodo, cardToken, cpf: card.cpf, issuer, paymentMethodId }),
      })
      const dataPag = await resPag.json()

      if (!resPag.ok) { setErro(dataPag.error || dataPag.motivo || 'Pagamento recusado.'); setLoading(false); return }

      if (metodo === 'pix') {
        ga.gerarPix()
        setQrCode(dataPag.qrCode || '')
        setQrBase64(dataPag.qrCodeBase64 || '')
        setPaymentId(String(dataPag.paymentId))
        setEtapa('pix-aguardando')
        iniciarPolling(String(dataPag.paymentId), uid)
      } else {
        if (dataPag.status === 'approved') {
          ga.compraConfirmada(String(dataPag.paymentId))
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
        <div className="buy-field">
          <label>Qual é o seu nicho?</label>
          <select value={nicho} onChange={e => setNicho(e.target.value)} className="buy-select">
            <option value="">Selecione seu segmento...</option>
            <option value="Moda e Roupas">Moda e Roupas</option>
            <option value="Confeitaria e Doces">Confeitaria e Doces</option>
            <option value="Alimentação">Alimentação</option>
            <option value="Artesanato / Handmade">Artesanato / Handmade</option>
            <option value="Beleza e Cosméticos">Beleza e Cosméticos</option>
            <option value="Papelaria e Personalizados">Papelaria e Personalizados</option>
            <option value="Serviços">Serviços</option>
            <option value="Outro">Outro</option>
          </select>
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
          <button className={`metodo-btn${metodo === 'pix' ? ' active' : ''}`} onClick={() => { setMetodo('pix'); ga.selecionarPix() }}>
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
              <line x1="14" y1="14" x2="14" y2="14"/><line x1="17" y1="14" x2="17" y2="14"/>
              <line x1="20" y1="14" x2="20" y2="14"/><line x1="14" y1="17" x2="14" y2="17"/>
              <line x1="17" y1="17" x2="20" y2="20"/>
            </svg>
            Pix
          </button>
          <button className={`metodo-btn${metodo === 'cartao' ? ' active' : ''}`} onClick={() => { setMetodo('cartao'); ga.selecionarCartao() }}>
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
    </div>
  )
}
