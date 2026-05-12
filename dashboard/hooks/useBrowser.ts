import { useState, useEffect } from 'react'

export function useBrowser() {
  const [browser, setBrowser] = useState<string | null>(null)

  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase()
    
    if (userAgent.includes('edg/')) {
      setBrowser('Edge')
    } else if (userAgent.includes('opr/') || userAgent.includes('opera')) {
      setBrowser('Opera')
    } else if (userAgent.includes('brave')) {
      setBrowser('Brave')
    } else if (userAgent.includes('chrome')) {
      setBrowser('Chrome')
    } else if (userAgent.includes('firefox')) {
      setBrowser('Firefox')
    } else if (userAgent.includes('safari') && !userAgent.includes('chrome')) {
      setBrowser('Safari')
    } else {
      setBrowser('Browser')
    }
  }, [])

  return browser
}
