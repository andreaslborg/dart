<template>
  <div class="gate">
    <form class="gate-card" @submit.prevent="submit">
      <svg width="56" height="56" viewBox="0 0 48 48" aria-hidden="true">
        <rect x="0" y="0" width="48" height="48" rx="12" fill="#5B95FF" />
        <path d="M15 10v28M15 10h10a7 7 0 0 1 0 14H15M15 24h12a7 7 0 0 1 0 14H15" fill="none" stroke="#0E0F12" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round" />
        <circle cx="25" cy="17" r="2.6" fill="#0E0F12" />
      </svg>
      <h1 class="gate-title">BORG<span class="accent">DART</span></h1>
      <p class="gate-sub">Indtast adgangskoden for at fortsætte.</p>
      <label class="sr-only" for="gate-password">Adgangskode</label>
      <input
        id="gate-password"
        ref="input"
        v-model="password"
        type="password"
        placeholder="Adgangskode"
        autocomplete="current-password"
        :class="{ wrong: error }"
        @input="error = ''"
      >
      <p class="gate-error" role="alert">{{ error }}</p>
      <button type="submit" class="gate-btn" :disabled="busy">{{ busy ? 'Tjekker …' : 'Lås op' }}</button>
    </form>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { signInWithPassword } from '@/auth';

export default {
  name: 'PasswordGate',
  emits: ['unlocked'],
  setup(props, { emit }) {
    const password = ref('');
    const error = ref('');
    const busy = ref(false);
    const input = ref(null);

    const messages = {
      wrong: 'Forkert adgangskode',
      network: 'Ingen forbindelse. Prøv igen.',
      throttled: 'For mange forsøg. Vent lidt og prøv igen.',
    };

    const submit = async () => {
      if (busy.value) return;
      busy.value = true;
      error.value = '';
      const res = await signInWithPassword(password.value);
      busy.value = false;
      if (res.ok) {
        emit('unlocked');
      } else {
        error.value = messages[res.reason] || messages.wrong;
        password.value = '';
        if (input.value) input.value.focus();
      }
    };

    onMounted(() => { if (input.value) input.value.focus(); });

    return { password, error, busy, input, submit };
  },
};
</script>

<style scoped>
.gate {
  min-height: 100vh;
  min-height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  box-sizing: border-box;
  background: var(--bg);
  color: var(--text);
  font-family: 'Barlow', system-ui, sans-serif;
}

.gate-card {
  width: 100%;
  max-width: 360px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 10px;
}

.gate-title {
  margin: 8px 0 0;
  font-family: 'Barlow Condensed', 'Arial Narrow', sans-serif;
  font-weight: 800;
  font-size: 40px;
  letter-spacing: 0.02em;
  line-height: 1;
}

.accent {
  color: var(--accent);
}

.gate-sub {
  margin: 0 0 12px;
  color: var(--muted);
  font-size: 15px;
}

input {
  width: 100%;
  box-sizing: border-box;
  height: 56px;
  padding: 0 16px;
  border-radius: 12px;
  border: 1px solid var(--line);
  background: var(--surface);
  color: var(--text);
  font-family: 'Barlow', system-ui, sans-serif;
  font-size: 18px;
  text-align: center;
  outline: none;
  transition: border-color 0.15s;
}

input:focus {
  border-color: var(--accent);
}

input.wrong {
  border-color: var(--danger);
  animation: shake 0.3s;
}

input::placeholder {
  color: var(--placeholder);
}

.gate-error {
  margin: 0;
  min-height: 20px;
  color: var(--danger);
  font-size: 14px;
  font-weight: 600;
}

.gate-btn {
  width: 100%;
  height: 56px;
  border: 0;
  border-radius: 12px;
  background: var(--accent);
  color: var(--on-accent);
  font-family: 'Barlow Condensed', 'Arial Narrow', sans-serif;
  font-weight: 800;
  font-size: 22px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  cursor: pointer;
}

.gate-btn:hover {
  background: var(--accent-hover);
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

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-6px); }
  75% { transform: translateX(6px); }
}
</style>
