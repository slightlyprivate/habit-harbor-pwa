export function analyticsEnabled(): boolean {
  try {
    const v = localStorage.getItem('habitlog_analytics_enabled')
    return v === null ? true : v === '1'
  } catch {
    return true
  }
}

export function setAnalyticsEnabled(enabled: boolean) {
  try { localStorage.setItem('habitlog_analytics_enabled', enabled ? '1' : '0') } catch {}
}

export function track(event: string, data?: Record<string, any>) {
  if (!analyticsEnabled()) return
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(window as any).umami?.track?.(event, data)
}

