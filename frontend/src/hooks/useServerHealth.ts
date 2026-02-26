import { useEffect, useMemo, useState } from 'react'

import { apiRequest } from '../api/client'
import type { HealthResponse } from '../types/auth'
import type { ServerStatus } from '../types/ui'

export const useServerHealth = () => {
  const [serverStatus, setServerStatus] = useState<ServerStatus>('checking')
  const [lastCheckedAt, setLastCheckedAt] = useState<Date | null>(null)

  const checkServerHealth = async () => {
    setServerStatus('checking')

    try {
      const health = await apiRequest<HealthResponse>('/health')
      setServerStatus(health.status === 'ok' ? 'online' : 'offline')
      setLastCheckedAt(new Date())
    } catch {
      setServerStatus('offline')
      setLastCheckedAt(new Date())
    }
  }

  useEffect(() => {
    void checkServerHealth()

    const intervalId = window.setInterval(() => {
      void checkServerHealth()
    }, 15000)

    return () => {
      window.clearInterval(intervalId)
    }
  }, [])

  const isCheckingNow = useMemo(() => serverStatus === 'checking', [serverStatus])

  return {
    serverStatus,
    lastCheckedAt,
    checkServerHealth,
    isCheckingNow,
  }
}