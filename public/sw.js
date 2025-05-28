
self.addEventListener('push', event => {
  let data = {}
  try {
    data = event.data?.json() || {}
  } catch (e) {
    console.warn('Fehler beim Parsen des Push-Datenformats:', e)
  }

  const title = data.title || 'Neue Benachrichtigung'
  const options = {
    body: data.body || '',
    icon: '/pwa-192x192.png',
    badge: '/pwa-maskable-192x192.png', // optional
    data: data.url ? { url: data.url } : {},
  }

  event.waitUntil(
    self.registration.showNotification(title, options)
  )
})

self.addEventListener('notificationclick', event => {
  event.notification.close()
  const targetUrl = event.notification.data?.url || '/'

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      for (const client of clientList) {
        if (client.url === targetUrl && 'focus' in client) {
          return client.focus()
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl)
      }
    })
  )
})
