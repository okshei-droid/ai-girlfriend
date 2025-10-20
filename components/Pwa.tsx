'use client'

import { useEffect } from 'react'

export default function Pwa() {
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!('serviceWorker' in navigator)) return

    // Registrera SW (no-op sw.js finns i /public)
    navigator.serviceWorker
      .register('/sw.js')
      .catch(() => {/* tyst */})

    // (valfritt) lyssna på beforeinstallprompt om du senare vill visa egen install-knapp
    const handler = (e: any) => {
      // e.preventDefault(); // spara e om du vill visa egen prompt senare
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  return null
}
