'use client'
import { useEffect } from 'react'

export function RefCapture() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const ref = params.get('ref')
    if (!ref) return
    localStorage.setItem('precifique_ref', ref)
    localStorage.setItem('precifique_ref_ts', String(Date.now()))
    // Fase 9a: inject UTM params for GA4 attribution
    if (!params.get('utm_source')) {
      params.set('utm_source', 'afiliado')
      params.set('utm_medium', 'indicacao')
      params.set('utm_campaign', ref)
      window.history.replaceState(null, '', `${window.location.pathname}?${params.toString()}`)
    }
  }, [])

  return null
}
