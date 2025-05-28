<script setup lang="ts">
import { usePocketbase } from '@/composables/usePocketbase'
import { Icon } from '@iconify/vue/dist/iconify.js';
import { onMounted, ref } from 'vue'

const { pb } = usePocketbase();
const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY || "__VAPID_PUBLIC_KEY__";

onMounted(() => {
  console.log('VAPID Public Key:', vapidPublicKey);
  // Prüfen, ob der Nutzer bereits abonniert ist
  pb.collection('push_subscriptions').getList(1, 1, {
    filter: `user="${pb.authStore.record?.id || ''}"`,
  }).then((res) => {
    isSubscribed.value = res.items.length > 0;
  }).catch((error) => {
    console.error('Fehler beim Überprüfen des Abos:', error);
  });
})

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
    applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
  })

  console.log('Push-Abo:', subscription)

  // 5. Subscription an PocketBase senden
  await pb.collection('push_subscriptions').create({
    endpoint: subscription.endpoint,
    auth: subscription.toJSON().keys?.auth,
    p256dh: subscription.toJSON().keys?.p256dh,
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
  <button class="btn btn-ghost" @click="subscribeToPush">
    <Icon :icon="isSubscribed?'ic:outline-notifications-active':'ic:outline-notifications'"
      width="16" />
  </button>
</template>
