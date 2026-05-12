import { useState, useEffect } from 'react'

export function useBrowser() {
  const [browser, setBrowser] = useState<string | null>(null)

  useEffect(() => {
    async function detect() {
      const userAgent = navigator.userAgent.toLowerCase()

      // Brave hides itself from userAgent for anti-fingerprinting,
      // but exposes a dedicated API: navigator.brave.isBrave()
      try {
        if ((navigator as any).brave && await (navigator as any).brave.isBrave()) {
          setBrowser('Brave')
          return
        }
      } catch {}

      if (userAgent.includes('edg/')) {
        setBrowser('Edge')
      } else if (userAgent.includes('opr/') || userAgent.includes('opera')) {
        setBrowser('Opera')
      } else if (userAgent.includes('chrome')) {
        setBrowser('Chrome')
      } else if (userAgent.includes('firefox')) {
        setBrowser('Firefox')
      } else if (userAgent.includes('safari') && !userAgent.includes('chrome')) {
        setBrowser('Safari')
      } else {
        setBrowser('Browser')
      }
    }
    detect()
  }, [])

  return browser
}
