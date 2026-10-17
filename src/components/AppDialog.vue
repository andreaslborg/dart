<template>
  <transition name="dialog">
    <div v-if="state.open" class="dialog-backdrop" @click.self="cancel">
      <div
        ref="card"
        class="dialog"
        :role="state.kind === 'alert' ? 'alertdialog' : 'dialog'"
        aria-modal="true"
        :aria-labelledby="state.title ? 'dialog-title' : null"
        aria-describedby="dialog-message"
        tabindex="-1"
        @keydown.esc.prevent="cancel"
      >
        <h2 v-if="state.title" id="dialog-title" class="dialog-title">{{ state.title }}</h2>
        <p v-if="state.message" id="dialog-message" class="dialog-message">{{ state.message }}</p>

        <form v-if="state.kind === 'prompt'" class="dialog-form" @submit.prevent="confirm">
          <label class="sr-only" for="dialog-input">{{ state.title || 'Indtast' }}</label>
          <input
            id="dialog-input"
            ref="input"
            v-model="state.value"
            type="text"
            :placeholder="state.placeholder"
            autocomplete="off"
            maxlength="40"
          >
        </form>

        <div class="dialog-actions" :class="{ single: state.kind === 'alert' }">
          <button v-if="state.kind !== 'alert'" type="button" class="btn secondary" @click="cancel">{{ state.cancelText }}</button>
          <button ref="primary" type="button" class="btn primary" :class="{ danger: state.danger }" @click="confirm">{{ state.confirmText }}</button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
import { ref, watch, nextTick } from 'vue';
import { dialogState, closeDialog } from '@/dialog';

export default {
  name: 'AppDialog',
  setup() {
    const input = ref(null);
    const primary = ref(null);
    const card = ref(null);
    let lastFocused = null;

    watch(() => dialogState.open, async (open) => {
      if (open) {
        lastFocused = document.activeElement;
        await nextTick();
        if (dialogState.kind === 'prompt' && input.value) {
          input.value.focus();
          input.value.select();
        } else if (primary.value) {
          primary.value.focus();
        }
      } else if (lastFocused && typeof lastFocused.focus === 'function') {
        lastFocused.focus();
        lastFocused = null;
      }
    });

    const confirm = () => closeDialog(true);
    const cancel = () => closeDialog(false);

    return { state: dialogState, input, primary, card, confirm, cancel };
  },
};
</script>

<style scoped>
.dialog-backdrop {
  position: fixed;
  inset: 0;
  z-index: 50;
  background: rgba(14, 15, 18, 0.8);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}

.dialog {
  width: 100%;
  max-width: 380px;
  box-sizing: border-box;
  background: #181A20;
  border: 1px solid #2A2D36;
  border-radius: 20px;
  padding: 24px 20px 20px;
  color: #F2F2EE;
  font-family: 'Barlow', system-ui, sans-serif;
  text-align: center;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.5);
  outline: none;
}

.dialog-title {
  margin: 0 0 8px;
  font-family: 'Barlow Condensed', 'Arial Narrow', sans-serif;
  font-weight: 800;
  font-size: 28px;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  line-height: 1.05;
}

.dialog-message {
  margin: 0;
  color: #C5C9D2;
  font-size: 16px;
  line-height: 1.45;
  white-space: pre-line;
}

.dialog-form {
  margin-top: 16px;
}

.dialog-form input {
  width: 100%;
  box-sizing: border-box;
  height: 52px;
  padding: 0 16px;
  border-radius: 12px;
  border: 1px solid #5B95FF;
  background: #0E0F12;
  color: #F2F2EE;
  font-family: 'Barlow Condensed', 'Arial Narrow', sans-serif;
  font-weight: 700;
  font-size: 22px;
  letter-spacing: 0.03em;
  outline: none;
}

.dialog-form input::placeholder {
  color: #4A4F5C;
}

.dialog-actions {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
  margin-top: 20px;
}

.dialog-actions.single {
  grid-template-columns: minmax(0, 1fr);
}

.btn {
  height: 50px;
  border-radius: 12px;
  border: 0;
  font-family: 'Barlow Condensed', 'Arial Narrow', sans-serif;
  font-weight: 800;
  font-size: 19px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  cursor: pointer;
}

.btn.primary {
  background: #5B95FF;
  color: #0E0F12;
}

.btn.primary:hover {
  background: #7AAAFF;
}

.btn.primary.danger {
  background: #FF9B8A;
}

.btn.primary.danger:hover {
  background: #FFB3A6;
}

.btn.secondary {
  background: #1E2027;
  color: #F2F2EE;
  border: 1px solid #2A2D36;
}

.btn.secondary:hover {
  background: #272A33;
}

.btn:focus-visible {
  outline: 2px solid #F2F2EE;
  outline-offset: 2px;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.dialog-enter-active,
.dialog-leave-active {
  transition: opacity 0.15s ease;
}

.dialog-enter-active .dialog,
.dialog-leave-active .dialog {
  transition: transform 0.15s ease;
}

.dialog-enter-from,
.dialog-leave-to {
  opacity: 0;
}

.dialog-enter-from .dialog,
.dialog-leave-to .dialog {
  transform: scale(0.96);
}
</style>
