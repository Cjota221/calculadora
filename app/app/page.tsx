'use client'
import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useCalculadora } from '@/hooks/useCalculadora'
import { useFreteCalc } from '@/hooks/useFreteCalc'
import { useEquilibrio } from '@/hooks/useEquilibrio'
import { TabNav } from '@/components/calculadora/TabNav'
import { TabPrecificar } from '@/components/calculadora/TabPrecificar'
import { TabFrete } from '@/components/calculadora/TabFrete'
import { TabEquilibrio } from '@/components/calculadora/TabEquilibrio'
import { TabGuia } from '@/components/calculadora/TabGuia'
import { TabSalvos } from '@/components/calculadora/TabSalvos'
import { Toast } from '@/components/ui/Toast'
import { UserAvatar } from '@/components/ui/UserAvatar'
import { Footer } from '@/components/layout/Footer'
import type { Tab } from '@/types'
import '@/styles/calculadora.css'

export default function AppPage() {
  const { user, loading, logout } = useAuth()
  const [tab, setTab] = useState<Tab>('precificacao')
  const [toast, setToast] = useState('')
  const [toastVisible, setToastVisible] = useState(false)

  const calc = useCalculadora()
  const frete = useFreteCalc()
  const eq = useEquilibrio()

  function showToast(msg: string) {
    setToast(msg)
    setToastVisible(true)
    setTimeout(() => setToastVisible(false), 2600)
  }

  function usarFrete(unit: number) {
    calc.setFreightUnit(unit.toFixed(2))
    setTab('precificacao')
    showToast('Frete aplicado! Complete os outros campos.')
  }

  if (loading) return null

  return (
    <>
      <div className="topbar">
        <div className="topbar-brand">Precifique<span>.</span></div>
        <div className="topbar-right">
          {user && <UserAvatar userId={user.id} nome={user.nome} initialData={user.avatar_data} />}
          <span className="topbar-user">{user?.nome.split(' ')[0]}</span>
          <button className="btn-logout" onClick={logout}>Sair</button>
        </div>
      </div>

      <div className="wrapper">
        <header className="hero">
          <div className="hero-wordmark">Precifique<span className="dot">.</span></div>
          <p className="app-hero-sub">Calcule preços, margens e ponto de equilíbrio com precisão</p>
        </header>

        <TabNav active={tab} onChange={setTab} />

        <div className={`tab-panel${tab === 'precificacao' ? ' active' : ''}`}>
          <TabPrecificar
            cost={calc.cost} setCost={calc.setCost}
            freightUnit={calc.freightUnit} setFreightUnit={calc.setFreightUnit}
            margin={calc.margin} setMargin={calc.setMargin}
            despesas={calc.despesas}
            taxas={calc.taxas}
            onAddDespesa={() => calc.addRow(calc.setDespesas)}
            onRemoveDespesa={id => calc.removeRow(calc.setDespesas, id, calc.despesas)}
            onUpdateDespesa={(id, field, val) => calc.updateRow(calc.setDespesas, id, field, val)}
            onAddTaxa={() => calc.addRow(calc.setTaxas)}
            onRemoveTaxa={id => calc.removeRow(calc.setTaxas, id, calc.taxas)}
            onUpdateTaxa={(id, field, val) => calc.updateRow(calc.setTaxas, id, field, val)}
            freteCalculado={frete.result?.unit ?? null}
            onUsarFreteCalculado={() => usarFrete(frete.result!.unit)}
            result={calc.result}
            discount={calc.discount} setDiscount={calc.setDiscount}
            promoOpen={calc.promoOpen} onTogglePromo={() => calc.setPromoOpen(o => !o)}
            nomeProduto={calc.nomeProduto}
            onNomeProdutoChange={calc.setNomeProduto}
            dataVenda={calc.dataVenda}
            onDataVendaChange={calc.setDataVenda}
            salvando={calc.salvando}
            onSalvarCalculo={() => calc.salvarCalculo(user!.id, showToast)}
            onCalcular={() => calc.calcular(showToast)}
          />
        </div>

        <div className={`tab-panel${tab === 'frete' ? ' active' : ''}`}>
          <TabFrete
            freightTotal={frete.freightTotal} setFreightTotal={frete.setFreightTotal}
            freightQty={frete.freightQty} setFreightQty={frete.setFreightQty}
            result={frete.result}
            onCalcular={() => frete.calcular(showToast)}
            onUsarFrete={usarFrete}
          />
        </div>

        <div className={`tab-panel${tab === 'equilibrio' ? ' active' : ''}`}>
          <TabEquilibrio
            fixedCosts={eq.fixedCosts} setFixedCosts={eq.setFixedCosts}
            eqSell={eq.eqSell} setEqSell={eq.setEqSell}
            eqCost={eq.eqCost} setEqCost={eq.setEqCost}
            result={eq.result}
            onCalcular={() => eq.calcular(showToast)}
          />
        </div>

        <div className={`tab-panel${tab === 'guia' ? ' active' : ''}`}>
          <TabGuia />
        </div>

        <div className={`tab-panel${tab === 'salvos' ? ' active' : ''}`}>
          {user && <TabSalvos userId={user.id} />}
        </div>
      </div>

      <Footer />
      <Toast message={toast} visible={toastVisible} />
    </>
  )
}
