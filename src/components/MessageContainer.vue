<template>
  <div class="message-container">
    <transition-group name="message" tag="div">
      <div 
        v-if="appStore.successMessage"
        key="success"
        class="message message-success"
      >
        <i class="fas fa-check-circle"></i>
        {{ appStore.successMessage }}
      </div>
      
      <div 
        v-if="appStore.errorMessage"
        key="error"
        class="message message-error"
      >
        <i class="fas fa-exclamation-circle"></i>
        {{ appStore.errorMessage }}
      </div>
    </transition-group>
  </div>
</template>

<script setup>
import { useAppStore } from '@/stores'

const appStore = useAppStore()
</script>

<style scoped>
.message-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
  max-width: 300px;
}

.message {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 15px 20px;
  margin-bottom: 10px;
  border-radius: var(--border-radius);
  box-shadow: var(--neu-shadow);
  font-weight: 500;
}

.message-success {
  background: #2ed573;
  color: white;
}

.message-error {
  background: #ff4757;
  color: white;
}

/* 动画 */
.message-enter-active,
.message-leave-active {
  transition: all 0.3s ease;
}

.message-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.message-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

/* 响应式 */
@media (max-width: 768px) {
  .message-container {
    top: 10px;
    right: 10px;
    left: 10px;
    max-width: none;
  }
}
</style>