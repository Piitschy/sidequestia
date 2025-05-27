<script setup lang="ts">
import { usePocketbase } from '@/composables/usePocketbase'
import { Icon } from '@iconify/vue/dist/iconify.js';
import { ref } from 'vue'

const { pb } = usePocketbase();

const isSubscribed = ref(false)

const subscribeToPush = async () => {
  // 1. Prüfen, ob Push unterstützt wird
  if (!('Notification' in window) || !('serviceWorker' in navigator) || !('PushManager' in window)) {
    alert('Push wird nicht unterstützt')
    return
  }

  // 2. Erlaubnis anfragen
  const permission = await Notification.requestPermission()
  if (permission !== 'granted') {
    alert('Benachrichtigungen abgelehnt')
    return
  }

  // 3. Service Worker muss bereit sein
  const swReg = await navigator.serviceWorker.ready

  // 4. Push-Abo registrieren (mit VAPID Public Key von deinem Server)
  const subscription = await swReg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array('<DEIN_VAPID_PUBLIC_KEY>')
  })

  // 5. Subscription an PocketBase senden
  await pb.collection('push_subscriptions').create({
    endpoint: subscription.endpoint,
    keys: {
      auth: subscription.toJSON().keys?.auth,
      p256dh: subscription.toJSON().keys?.p256dh
    },
    // optional: user-id, falls du angemeldet bist
    user: pb.authStore.record?.id || undefined
  })

  isSubscribed.value = true
  alert('Push-Abo erfolgreich!')
}

// Hilfsfunktion: Base64 in Uint8Array
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4)
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  return Uint8Array.from([...rawData].map(char => char.charCodeAt(0)))
}
</script>

<template>
  <button class="btn" @click="subscribeToPush">
    <Icon :icon="isSubscribed?'ic:outline-notifications-active':'ic:outline-notifications'" width="24" />
  </button>
</template>
