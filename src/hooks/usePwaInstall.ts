import { useCallback, useEffect, useState } from 'react'
import type { BeforeInstallPromptEvent } from '../types'

export function usePwaInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [canInstall, setCanInstall] = useState(false)

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      const bip = e as BeforeInstallPromptEvent
      setDeferredPrompt(bip)
      setCanInstall(true)
    }
    window.addEventListener('beforeinstallprompt', handler as EventListener)
    return () => window.removeEventListener('beforeinstallprompt', handler as EventListener)
  }, [])

  const promptInstall = useCallback(async () => {
    if (!deferredPrompt) return null
    deferredPrompt.prompt()
    const result = await deferredPrompt.userChoice
    setDeferredPrompt(null)
    setCanInstall(false)
    return result
  }, [deferredPrompt])

  return { canInstall, promptInstall }
}

