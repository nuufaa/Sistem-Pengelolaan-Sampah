import { ref } from 'vue'

const isToastVisible = ref(false)
const toastMessage = ref('')
const toastIcon = ref('')
const toastColor = ref('')

export function useToast() {
  const showToast = (message, type = 'success') => {
    toastMessage.value = message

    if (type === 'error') {
      toastIcon.value = 'error'
      toastColor.value = '#F44336'
    } else if (type === 'info') {
      toastIcon.value = 'info'
      toastColor.value = '#2196F3'
    } else {
      toastIcon.value = 'check_circle'
      toastColor.value = '#4CAF50'
    }

    isToastVisible.value = true

    setTimeout(() => {
      isToastVisible.value = false
    }, 3000)
  }

  return {
    isToastVisible,
    toastMessage,
    toastIcon,
    toastColor,
    showToast
  }
}