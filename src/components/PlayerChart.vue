<template>
  <figure class="chart" :aria-label="title">
    <div ref="box" class="plot" @pointerleave="active = null">
      <svg
        v-if="width > 0"
        :width="width"
        :height="height"
        class="svg"
        role="img"
        :aria-label="`${title}: ${points.length} kampe. Brug piletasterne for at se hver kamp.`"
        tabindex="0"
        @pointermove="onMove"
        @pointerdown="onMove"
        @keydown="onKey"
        @blur="active = null"
      >
        <!-- grid + y labels -->
        <g class="grid">
          <g v-for="t in yTicks" :key="t">
            <line :x1="padL" :x2="width - padR" :y1="y(t)" :y2="y(t)" />
            <text :x="padL - 8" :y="y(t)" dy="0.32em" text-anchor="end">{{ t }}{{ suffix }}</text>
          </g>
        </g>
        <!-- x labels: first and last date -->
        <text v-if="points.length" class="xlabel" :x="x(0)" :y="height - 6" text-anchor="start">{{ points[0].label }}</text>
        <text v-if="points.length > 1" class="xlabel" :x="x(points.length - 1)" :y="height - 6" text-anchor="end">{{ points[points.length - 1].label }}</text>

        <!-- crosshair -->
        <line v-if="active !== null" class="crosshair" :x1="x(active)" :x2="x(active)" :y1="padT" :y2="height - padB" />

        <!-- line -->
        <path class="line" :d="path" />
        <!-- markers with a surface ring -->
        <circle
          v-for="(p, i) in points"
          :key="i"
          class="dot"
          :class="{ on: active === i }"
          :cx="x(i)"
          :cy="y(p.y)"
          :r="active === i ? 6 : 4"
        />
        <!-- direct label on the latest value -->
        <text v-if="points.length" class="last" :x="x(points.length - 1)" :y="y(points[points.length - 1].y) - 12" text-anchor="end">{{ fmt(points[points.length - 1].y) }}{{ suffix }}</text>
      </svg>

      <div v-if="active !== null" class="tip" :style="tipStyle" role="status">
        <div class="tip-value">{{ fmt(points[active].y) }}{{ suffix }}</div>
        <div class="tip-sub">{{ points[active].label }} · {{ points[active].sub }}</div>
      </div>
    </div>

    <details class="table-view">
      <summary>Vis som tabel</summary>
      <table>
        <thead><tr><th>Dato</th><th>Kamp</th><th>{{ title }}</th></tr></thead>
        <tbody>
          <tr v-for="(p, i) in points" :key="i"><td>{{ p.label }}</td><td>{{ p.sub }}</td><td>{{ fmt(p.y) }}{{ suffix }}</td></tr>
        </tbody>
      </table>
    </details>
  </figure>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue';

export default {
  name: 'PlayerChart',
  props: {
    // [{ y: number, label: string (date), sub: string (opponent/result) }]
    points: { type: Array, required: true },
    title: { type: String, default: '' },
    suffix: { type: String, default: '' },
  },
  setup(props) {
    const box = ref(null);
    const width = ref(0);
    const height = 200;
    const padL = 40;
    const padR = 14;
    const padT = 22;
    const padB = 26;
    const active = ref(null);
    let ro = null;

    const fmt = (v) => (v % 1 === 0 ? String(v) : v.toFixed(1));

    const yMax = computed(() => {
      const max = Math.max(10, ...props.points.map(p => p.y));
      const step = max > 60 ? 20 : 10;
      return Math.ceil(max / step) * step;
    });
    const yTicks = computed(() => {
      const step = yMax.value > 60 ? 20 : 10;
      const ticks = [];
      for (let t = 0; t <= yMax.value; t += step) ticks.push(t);
      return ticks;
    });

    const x = (i) => {
      const n = props.points.length;
      if (n <= 1) return (padL + width.value - padR) / 2;
      return padL + (i / (n - 1)) * (width.value - padL - padR);
    };
    const y = (v) => padT + (1 - v / yMax.value) * (height - padT - padB);

    const path = computed(() => props.points.map((p, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(p.y).toFixed(1)}`).join(''));

    const onMove = (e) => {
      if (!props.points.length) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const px = e.clientX - rect.left;
      let best = 0;
      let dist = Infinity;
      props.points.forEach((p, i) => {
        const d = Math.abs(x(i) - px);
        if (d < dist) { dist = d; best = i; }
      });
      active.value = best;
    };

    const onKey = (e) => {
      const n = props.points.length;
      if (!n) return;
      if (e.key === 'ArrowRight') { active.value = active.value === null ? 0 : Math.min(n - 1, active.value + 1); e.preventDefault(); }
      if (e.key === 'ArrowLeft') { active.value = active.value === null ? n - 1 : Math.max(0, active.value - 1); e.preventDefault(); }
      if (e.key === 'Escape') active.value = null;
    };

    const tipStyle = computed(() => {
      if (active.value === null) return {};
      const px = x(active.value);
      const left = Math.min(Math.max(px, 70), width.value - 70);
      return { left: `${left}px` };
    });

    onMounted(() => {
      const measure = () => { if (box.value) width.value = box.value.clientWidth; };
      measure();
      if (window.ResizeObserver) {
        ro = new ResizeObserver(measure);
        ro.observe(box.value);
      } else {
        window.addEventListener('resize', measure);
      }
    });
    onUnmounted(() => { if (ro) ro.disconnect(); });

    return { box, width, height, padL, padR, padT, padB, active, yTicks, x, y, path, onMove, onKey, tipStyle, fmt };
  },
};
</script>

<style scoped>
.chart {
  margin: 0;
}

.plot {
  position: relative;
  touch-action: pan-y;
}

.svg {
  display: block;
  outline: none;
  overflow: visible;
}

.svg:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 4px;
  border-radius: 8px;
}

.grid line {
  stroke: var(--line2);
  stroke-width: 1;
}

.grid text,
.xlabel {
  fill: var(--muted);
  font-size: 11px;
  font-family: 'Barlow', system-ui, sans-serif;
}

.crosshair {
  stroke: var(--muted);
  stroke-width: 1;
  stroke-dasharray: 3 3;
}

.line {
  fill: none;
  stroke: var(--chart);
  stroke-width: 2;
  stroke-linejoin: round;
  stroke-linecap: round;
}

.dot {
  fill: var(--chart);
  stroke: var(--surface);
  stroke-width: 2;
  transition: r 0.1s;
}

.last {
  fill: var(--text);
  font-size: 13px;
  font-weight: 700;
  font-family: 'Barlow', system-ui, sans-serif;
}

.tip {
  position: absolute;
  top: -6px;
  transform: translate(-50%, -100%);
  background: var(--bg);
  border: 1px solid var(--line);
  border-radius: 10px;
  padding: 6px 10px;
  box-shadow: 0 8px 20px var(--shadow);
  pointer-events: none;
  white-space: nowrap;
  z-index: 2;
}

.tip-value {
  font-family: var(--display);
  font-weight: 800;
  font-size: 20px;
  color: var(--text);
  line-height: 1.1;
}

.tip-sub {
  font-size: 12px;
  color: var(--muted);
}

.table-view {
  margin-top: 10px;
  font-size: 13px;
  color: var(--muted);
}

.table-view summary {
  cursor: pointer;
  padding: 4px 0;
}

.table-view table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 6px;
  color: var(--text);
  font-variant-numeric: tabular-nums;
}

.table-view th,
.table-view td {
  text-align: left;
  padding: 6px 4px;
  border-bottom: 1px solid var(--line2);
}

.table-view th:last-child,
.table-view td:last-child {
  text-align: right;
}

.table-view th {
  color: var(--muted);
  font-weight: 600;
}
</style>
