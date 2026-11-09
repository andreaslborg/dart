<template>
  <div class="menu-wrap">
    <button
      ref="toggle"
      type="button"
      class="menu-toggle"
      :class="{ open }"
      aria-label="Menu"
      aria-haspopup="true"
      :aria-expanded="open ? 'true' : 'false'"
      aria-controls="app-menu"
      @click="open = !open"
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
        <path v-if="!open" d="M4 7h16M4 12h16M4 17h16" />
        <path v-else d="M6 6l12 12M18 6L6 18" />
      </svg>
    </button>

    <div v-if="open" class="menu-backdrop" @click="close"></div>

    <transition name="menu">
      <nav v-if="open" id="app-menu" class="menu" aria-label="Menu">
        <router-link :to="historyLink" class="menu-item" @click="close">
          <span class="menu-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 12a9 9 0 1 0 3-6.7L3 8" /><path d="M3 3v5h5" /><path d="M12 7v5l3 2" /></svg>
          </span>
          <span class="menu-text">
            <span class="menu-label">Historik</span>
            <span class="menu-desc">Kampe, head-to-head og rekorder</span>
          </span>
          <svg class="chev" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6" /></svg>
        </router-link>

        <router-link :to="aiLink" class="menu-item" @click="close">
          <span class="menu-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="8" width="14" height="11" rx="3" /><path d="M12 4v4" /><circle cx="12" cy="3.5" r="1" /><circle cx="9.5" cy="13" r="0.8" /><circle cx="14.5" cy="13" r="0.8" /><path d="M10 16h4" /></svg>
          </span>
          <span class="menu-text">
            <span class="menu-label">Spil mod AI</span>
            <span class="menu-desc">Fire niveauer, fra Begynder til Pro</span>
          </span>
          <svg class="chev" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6" /></svg>
        </router-link>

        <router-link :to="localLink" class="menu-item" @click="close">
          <span class="menu-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="9" cy="8" r="3" /><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" /><circle cx="17" cy="9" r="2.5" /><path d="M16 14.2c2.9.4 5 2.8 5 5.8" /></svg>
          </span>
          <span class="menu-text">
            <span class="menu-label">Lokalt mod venner</span>
            <span class="menu-desc">2–4 spillere eller hold på én telefon</span>
          </span>
          <svg class="chev" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6" /></svg>
        </router-link>

        <router-link :to="settingsLink" class="menu-item" @click="close">
          <span class="menu-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12" /><circle cx="16" cy="6" r="2" /><circle cx="10" cy="12" r="2" /><circle cx="18" cy="18" r="2" /></svg>
          </span>
          <span class="menu-text">
            <span class="menu-label">Indstillinger</span>
            <span class="menu-desc">Navn, tema og spilregler</span>
          </span>
          <svg class="chev" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6" /></svg>
        </router-link>
      </nav>
    </transition>
  </div>
</template>

<script>
import { ref, computed, watch, nextTick, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';

export default {
  name: 'AppMenu',
  setup() {
    const route = useRoute();
    const open = ref(false);
    const toggle = ref(null);

    const historyLink = computed(() => ({ path: '/historik', query: route.query }));
    const aiLink = computed(() => ({ path: '/ai', query: route.query }));
    const localLink = computed(() => ({ path: '/lokalt', query: route.query }));
    const settingsLink = computed(() => ({ path: '/indstillinger', query: route.query }));

    const close = () => { open.value = false; };
    const closeAndFocus = async () => {
      close();
      await nextTick();
      if (toggle.value) toggle.value.focus();
    };

    // Escape closes the menu wherever focus is, but only while it is open.
    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        closeAndFocus();
      }
    };

    watch(open, async (isOpen) => {
      if (!isOpen) {
        document.removeEventListener('keydown', onKey);
        return;
      }
      document.addEventListener('keydown', onKey);
      await nextTick();
      const first = document.querySelector('#app-menu .menu-item');
      if (first) first.focus();
    });

    onUnmounted(() => document.removeEventListener('keydown', onKey));

    return { open, toggle, historyLink, aiLink, localLink, settingsLink, close, closeAndFocus };
  },
};
</script>

<style scoped>
.menu-wrap {
  position: relative;
}

.menu-toggle {
  position: relative;
  z-index: 32;
  width: 40px;
  height: 40px;
  border-radius: 999px;
  border: 1px solid var(--line);
  background: transparent;
  color: var(--muted);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: color 0.15s, border-color 0.15s, background-color 0.15s;
}

.menu-toggle:hover,
.menu-toggle.open {
  color: var(--text);
  border-color: var(--accent);
}

.menu-toggle.open {
  background: var(--surface);
}

.menu-backdrop {
  position: fixed;
  inset: 0;
  z-index: 30;
}

.menu {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  z-index: 31;
  width: min(320px, calc(100vw - 32px));
  box-sizing: border-box;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 16px;
  padding: 6px;
  box-shadow: 0 20px 50px var(--shadow);
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-family: 'Barlow', system-ui, sans-serif;
  text-align: left;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 60px;
  padding: 10px 12px;
  border-radius: 12px;
  color: var(--text);
  text-decoration: none;
  outline: none;
}

a.menu-item:hover,
a.menu-item:focus-visible {
  background: var(--key);
}

a.menu-item:focus-visible {
  box-shadow: inset 0 0 0 2px var(--accent);
}

.menu-icon {
  width: 36px;
  height: 36px;
  flex: 0 0 36px;
  border-radius: 10px;
  background: var(--bg);
  color: var(--accent);
  display: flex;
  align-items: center;
  justify-content: center;
}

.menu-text {
  display: flex;
  flex-direction: column;
  gap: 1px;
  flex: 1;
  min-width: 0;
}

.menu-label {
  font-family: 'Barlow Condensed', 'Arial Narrow', sans-serif;
  font-weight: 700;
  font-size: 19px;
  letter-spacing: 0.03em;
  text-transform: uppercase;
  line-height: 1.1;
}

.menu-desc {
  font-size: 13px;
  color: var(--muted);
  line-height: 1.3;
}

.chev {
  color: var(--muted);
  flex: 0 0 auto;
}

.menu-item.soon {
  cursor: default;
}

.menu-item.soon .menu-icon {
  color: var(--faint);
}

.menu-item.soon .menu-label {
  color: var(--muted);
}

.menu-item.soon .menu-desc {
  color: var(--faint);
}

.soon-tag {
  align-self: flex-start;
  margin-top: 5px;
  font-family: 'Barlow Condensed', 'Arial Narrow', sans-serif;
  font-weight: 700;
  font-size: 11px;
  letter-spacing: 0.1em;
  color: var(--gold-text);
  border: 1px solid var(--gold-text);
  border-radius: 999px;
  padding: 3px 7px;
  white-space: nowrap;
}

.menu-enter-active,
.menu-leave-active {
  transition: opacity 0.12s ease, transform 0.12s ease;
}

.menu-enter-from,
.menu-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
