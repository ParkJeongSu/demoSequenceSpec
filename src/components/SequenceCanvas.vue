<template>
  <div class="canvas-wrapper"
  @scroll="handleScroll"
  ref="scrollRef"
  >
   <!-- Actor columns -->
    <div
      v-for="actor in actors"
      :key="actor.id"
      class="actor-column"
    >
    <div class="actor-label">{{ actor.name }}</div>

      <!-- 가상 포인트들 -->
      <div class="point-container">
        <div
          v-for="i in virtualPointCount"
          :key="`pt-${actor.id}-${i}`"
          class="virtual-point"
          @mousedown="startDrag(actor.id, i * gap)"
        />
      </div>
    </div>
  </div>

  <svg class="drag-line-layer" v-if="isDragging">
  <line
    :x1="startX"
    :y1="startY"
    :x2="mousePos.x"
    :y2="mousePos.y"
    stroke="#1976d2"
    stroke-width="2"
  />
</svg>
</template>

<script setup lang="ts">
import type { Actor } from '@/stores/project'
import { ref, onMounted, onUnmounted } from 'vue'

defineProps<{
  actors: Actor[]
}>()

const gap = 50
const virtualPointCount = ref(20)

const isDragging = ref(false)
const dragStart = ref<{ actorId: string, y: number } | null>(null)
const mousePos = ref({ x: 0, y: 0 })

const startX = 300
const startY = dragStart.value?.y ?? 0

function handleScroll(e: Event) {
  const target = e.target as HTMLElement
  const nearBottom = target.scrollTop + target.clientHeight >= target.scrollHeight - 100

  if (nearBottom) {
    virtualPointCount.value += 10 // 스크롤 아래에 도달하면 10개 추가
  }
}

function startDrag(actorId: string, y: number) {
  isDragging.value = true
  dragStart.value = { actorId, y }
  window.addEventListener('mousemove', onMouseMove)
  window.addEventListener('mouseup', onMouseUp)
}

function onMouseMove(e: MouseEvent) {
  mousePos.value = { x: e.clientX, y: e.clientY }
}

function onMouseUp() {
  isDragging.value = false
  window.removeEventListener('mousemove', onMouseMove)
  window.removeEventListener('mouseup', onMouseUp)

  // TODO: 도착 Actor 판별 → emit('connect-message', fromId, toId)
  console.log('드래그 끝 위치:', mousePos.value)
  // emit 예시: emit('connect-message', dragStart.value.actorId, toActorId)
}

</script>


<style scoped>
.canvas-wrapper {
  display: flex;
  flex-direction: row;
  gap: 24px;
  padding: 24px;
  background-color: #f5f5f5;
  overflow-x: auto;
  overflow-y: auto;
  height: 600px; /* 스크롤 생기게 하기 위한 제한 */
}

.actor-column {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 120px;
  background-color: white;
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 8px;
}

.actor-label {
  font-weight: bold;
  margin-bottom: 8px;
  text-align: center;
}

.point-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.virtual-point {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: #2196f3;
  cursor: pointer;
  transition: background-color 0.2s;
}

.virtual-point:hover {
  background-color: #1565c0;
}

</style>
