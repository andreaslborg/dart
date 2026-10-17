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

        <div class="menu-item soon" aria-disabled="true">
          <span class="menu-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12" /><circle cx="16" cy="6" r="2" /><circle cx="10" cy="12" r="2" /><circle cx="18" cy="18" r="2" /></svg>
          </span>
          <span class="menu-text">
            <span class="menu-label">Indstillinger</span>
            <span class="menu-desc">Spillere, lyd og spilregler</span>
            <span class="soon-tag">KOMMER SNART</span>
          </span>
        </div>

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

    return { open, toggle, historyLink, aiLink, close, closeAndFocus };
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
  border: 1px solid #2A2D36;
  background: transparent;
  color: #9AA0AD;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: color 0.15s, border-color 0.15s, background-color 0.15s;
}

.menu-toggle:hover,
.menu-toggle.open {
  color: #F2F2EE;
  border-color: #5B95FF;
}

.menu-toggle.open {
  background: #181A20;
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
  background: #181A20;
  border: 1px solid #2A2D36;
  border-radius: 16px;
  padding: 6px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
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
  color: #F2F2EE;
  text-decoration: none;
  outline: none;
}

a.menu-item:hover,
a.menu-item:focus-visible {
  background: #1E2027;
}

a.menu-item:focus-visible {
  box-shadow: inset 0 0 0 2px #5B95FF;
}

.menu-icon {
  width: 36px;
  height: 36px;
  flex: 0 0 36px;
  border-radius: 10px;
  background: #0E0F12;
  color: #5B95FF;
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
  color: #9AA0AD;
  line-height: 1.3;
}

.chev {
  color: #9AA0AD;
  flex: 0 0 auto;
}

.menu-item.soon {
  cursor: default;
}

.menu-item.soon .menu-icon {
  color: #6B7080;
}

.menu-item.soon .menu-label {
  color: #9AA0AD;
}

.menu-item.soon .menu-desc {
  color: #6B7080;
}

.soon-tag {
  align-self: flex-start;
  margin-top: 5px;
  font-family: 'Barlow Condensed', 'Arial Narrow', sans-serif;
  font-weight: 700;
  font-size: 11px;
  letter-spacing: 0.1em;
  color: #FFB547;
  border: 1px solid rgba(255, 181, 71, 0.4);
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
