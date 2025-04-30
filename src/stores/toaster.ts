import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export enum ToastType {
  "info",
  "success",
  "error"
}

type Toast = {
  id: number
  msg: string
  type: ToastType
}

export const useToasterStore = defineStore('toaster', () => {

  const toasts = ref<Toast[]>([])

  const deleteToast = (id: Toast['id']) => {
    toasts.value = [...toasts.value.filter((toast) => toast.id !== id)]
  }

  const notify = (msg: string, type?: ToastType, duration: number = 3000) => {
    const id = new Date().getTime()
    toasts.value.push({
      id,
      msg,
      type: type ?? ToastType.info
    })
    setTimeout(() => {
      deleteToast(id)
    }, duration)
  }
  return { notify, toasts }
})
