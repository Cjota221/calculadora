'use client'
import { useEffect } from 'react'

export function RefCapture() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const ref = params.get('ref')
    if (!ref) return
    localStorage.setItem('precifique_ref', ref)
    localStorage.setItem('precifique_ref_ts', String(Date.now()))
  }, [])

  return null
}
