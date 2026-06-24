import { useEffect, useRef, useCallback } from 'react'
import { Client, IMessage } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import { useAuthStore } from '@/store/authStore'
import { useQueryClient } from '@tanstack/react-query'
import type { Notification } from '@/types'

export function useWebSocket() {
  const clientRef = useRef<Client | null>(null)
  const { accessToken, isAuthenticated } = useAuthStore()
  const queryClient = useQueryClient()

  const connect = useCallback(() => {
    if (!isAuthenticated || !accessToken || clientRef.current?.connected) return

    const client = new Client({
      webSocketFactory: () => new SockJS('/api/ws'),
      connectHeaders: {
        Authorization: `Bearer ${accessToken}`,
      },
      debug: () => {},
      reconnectDelay: 5000,

      onConnect: () => {
        console.log('[WS] Connected')

        // Subscribe to personal notification queue
        client.subscribe('/user/queue/notifications', (message: IMessage) => {
          try {
            const notification: Notification = JSON.parse(message.body)
            // Invalidate React Query cache so unread count & list refresh
            queryClient.invalidateQueries({ queryKey: ['notifications'] })
            queryClient.invalidateQueries({ queryKey: ['notifications', 'unread'] })

            // Browser notification (if permission granted)
            if (Notification.permission === 'granted') {
              new Notification(notification.title, {
                body: notification.message,
                icon: '/favicon.svg',
              })
            }
          } catch (e) {
            console.warn('[WS] Failed to parse notification', e)
          }
        })
      },

      onDisconnect: () => console.log('[WS] Disconnected'),
      onStompError: (frame) => console.error('[WS] STOMP error', frame),
    })

    client.activate()
    clientRef.current = client
  }, [accessToken, isAuthenticated, queryClient])

  const disconnect = useCallback(() => {
    clientRef.current?.deactivate()
    clientRef.current = null
  }, [])

  useEffect(() => {
    if (isAuthenticated) {
      connect()
    } else {
      disconnect()
    }
    return () => { disconnect() }
  }, [isAuthenticated, connect, disconnect])

  // Request browser notification permission
  useEffect(() => {
    if (isAuthenticated && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [isAuthenticated])

  return { connected: clientRef.current?.connected ?? false }
}
