'use client'
import Script from 'next/script'
import { useEffect } from 'react'

export function PopupLoader() {
  useEffect(() => {
    if (sessionStorage.getItem('popup_lead_visto')) return
    sessionStorage.setItem('popup_lead_visto', 'true')
  }, [])

  return (
    <Script
      src="https://cjota-precifique.9eo9b2.easypanel.host/popup.js"
      strategy="afterInteractive"
    />
  )
}
