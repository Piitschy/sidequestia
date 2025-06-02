
self.addEventListener('push', event => {
  let data = {}
  console.log('Push event received:', event)
  try {
    data = event.data?.json() || {}
  } catch (e) {
    console.warn('Error parsing push event data:', e)
  }

  const title = data.title || 'New Notification'
  const options = {
    body: data.body || '',
    icon: '/favicon.ico',
    badge: '/favicon.ico', // optional
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
