<template>
  <div class="canvas-header">
    <div
      class="actor-label"
      v-for="actor in actors"
      :key="actor.id"
      :style="{ width: actorWidth + 20 + 'px' }"
    >
      <!-- 편집 중이면 입력창 -->
      <v-text-field
        v-if="editingActorId === actor.id"
        v-model="editingActorName"
        dense
        hide-details
        variant="solo"
        autofocus
        @blur="onBlurActor(actor)"
        @keydown.enter="finishActorEdit(actor)"
        @keydown.esc="cancelActorEdit"
      />

      <!-- 편집 중이 아니면 텍스트 -->
      <span v-else @dblclick="startActorEdit(actor)">
        {{ actor.name }}
      </span>
    </div>
  </div>
  <div class="canvas-wrapper" @scroll="handleScroll" ref="scrollRef">
    <!-- Actor columns -->
    <div
      v-for="actor in actors"
      :key="actor.id"
      class="actor-column"
      :style="{ height: virtualPointCount * pointGap + 'px' }"
    >
      <!-- 가상 포인트들 -->
      <div class="point-container">
        <div
          v-for="i in virtualPointCount"
          :key="`pt-${actor.id}-${i}`"
          class="virtual-point"
          :ref="(el) => registerPoint(el, actor.id, i)"
          @mousedown="startDrag(actor.id, i)"
        />
      </div>
    </div>
    <svg class="svg-message-layer" :style="{ height: virtualPointCount * pointGap + 'px' }">
      <defs>
        <marker
          id="arrowhead"
          markerWidth="10"
          markerHeight="7"
          refX="10"
          refY="3.5"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <polygon points="0 0, 10 3.5, 0 7" fill="#1976d2" />
        </marker>
      </defs>
      <line
        v-for="message in props.messages"
        :key="message.id + '-line'"
        :x1="getActorX(message.fromActorId)"
        :y1="getYByLogicalIndex(message.fromLogicalY)"
        :x2="getActorX(message.toActorId)"
        :y2="getYByLogicalIndex(message.toLogicalY)"
        stroke="#1976d2"
        stroke-width="2"
        marker-end="url(#arrowhead)"
      />
      <text
        v-for="message in props.messages"
        :key="message.id + '-label'"
        :x="(getActorX(message.fromActorId) + getActorX(message.toActorId)) / 2"
        :y="
          (getYByLogicalIndex(message.fromLogicalY) + getYByLogicalIndex(message.toLogicalY)) / 2 -
          8
        "
        font-size="12"
        fill="#333"
        text-anchor="middle"
        pointer-events="auto"
        @dblclick="handleDoubleClick(message.id)"
      >
        {{ logRender(message) }}
      </text>
    </svg>
    <MemoBlock
      class="memo-block"
      v-for="memo in memoBlocks"
      :key="memo.id"
      :memo="memo"
      @update="
        (update) => {
          console.log('메모 업데이트:', update)
          return emit('update-memo', update)
        }
      "
      @delete="
        (id) => {
          console.log('메모 삭제:', id)
          return emit('delete-memo', id)
        }
      "
    />
  </div>
</template>

<script setup lang="ts">
// {{ message.spec?.messageName || 'NewMessage' }}
import type { Actor, Message, MemoBlockData } from '@/stores/project'
import type { ComponentPublicInstance } from 'vue'
import { ref, onMounted, onUnmounted, watch } from 'vue'
import MemoBlock from './MemoBlock.vue'

import { useProjectStore } from '@/stores/project'

type PointRef = {
  actorId: string
  logicalY: number
  el: HTMLElement
}

const store = useProjectStore()

const pointRefs = ref<PointRef[]>([])
const editingActorId = ref<string | null>(null)
const editingActorName = ref('')
let skipBlur = false

const emit = defineEmits<{
  (
    e: 'connect-message',
    from: { actorId: string; logicalY: number },
    to: { actorId: string; logicalY: number },
  ): void
  (e: 'double-click-message', messageId: string): void
  (e: 'update-memo', updated: MemoBlockData): void
  (e: 'delete-memo', id: string): void
}>()

const props = defineProps<{
  actors: Actor[]
  messages: Message[]
  memoBlocks: MemoBlockData[]
}>()

watch(
  () => props.messages,
  (val) => {
    console.log('[Canvas] messages prop 변경됨:', val)
  },
  { immediate: true, deep: true },
)

function logRender(msg: Message) {
  console.log('[RENDERING MESSAGE]', msg.id)
  return msg.spec?.messageName || 'NewMessage'
}

const actors = props.actors
const messages = props.messages

const actorWidth = 120
const actorGap = 24

const pointGap = 50 // 포인트 간격 (픽셀 기준)
const virtualPointCount = ref(20)

const isDragging = ref(false)
const dragStart = ref<{ actorId: string; logicalY: number } | null>(null)
const mousePos = ref({ x: 0, y: 0 })

function handleScroll(e: Event) {
  const target = e.target as HTMLElement
  const nearBottom = target.scrollTop + target.clientHeight >= target.scrollHeight - 100

  if (nearBottom) {
    virtualPointCount.value += 10 // 스크롤 아래에 도달하면 10개 추가
  }
}

function startDrag(actorId: string, logicalY: number) {
  console.log('dragStart 등록됨:', actorId, logicalY)
  isDragging.value = true
  dragStart.value = { actorId: actorId, logicalY: logicalY }
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

  if (!dragStart.value) {
    console.warn('드래그 시작 포인트가 null입니다. emit 중단')
    return
  }

  const threshold = 20
  let nearestPoint: PointRef | null = null
  let minDistance = Infinity

  for (const point of pointRefs.value) {
    const rect = point.el.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2

    const dx = mousePos.value.x - centerX
    const dy = mousePos.value.y - centerY
    const distance = Math.sqrt(dx * dx + dy * dy)

    if (distance < threshold && distance < minDistance) {
      nearestPoint = point
      minDistance = distance
    }
  }

  if (nearestPoint) {
    console.log('연결 성공:', dragStart.value.actorId, '→', nearestPoint.actorId)
    console.log('연결 y좌표:', dragStart.value.logicalY, '→', nearestPoint.logicalY)

    emit(
      'connect-message',
      {
        actorId: dragStart.value.actorId,
        logicalY: dragStart.value.logicalY,
      },
      {
        actorId: nearestPoint.actorId,
        logicalY: nearestPoint.logicalY,
      },
    )
  } else {
    console.log('도착 포인트 없음, 연결 안함')
  }
}

function registerPoint(
  el: Element | ComponentPublicInstance | null,
  actorId: string,
  logicalY: number,
) {
  if (el instanceof HTMLElement) {
    pointRefs.value.push({ actorId, logicalY, el })
  }
}

function getActorX(actorId: string): number {
  const index = actors.findIndex((a) => a.id === actorId)
  if (index === -1) return 0
  return index * (actorWidth + actorGap) + actorWidth / 2
}

function getYByLogicalIndex(logicalY: number) {
  return logicalY * (pointGap + 10) - 15
}

function handleDoubleClick(id: string) {
  console.log('더블클릭한 메시지 ID:', id)
  emit('double-click-message', id)
}

function startActorEdit(actor: Actor) {
  editingActorId.value = actor.id
  editingActorName.value = actor.name
}

function finishActorEdit(actor: Actor) {
  skipBlur = true
  store.updateActorName(actor.id, editingActorName.value)
  editingActorId.value = null
  editingActorName.value = ''
  store.markChanged?.() // 선택사항
}

function onBlurActor(actor: Actor) {
  if (skipBlur) {
    skipBlur = false
    return
  }
  finishActorEdit(actor)
}

function cancelActorEdit() {
  skipBlur = true
  editingActorId.value = null
  editingActorName.value = ''
}
</script>

<style scoped>
.memo-block {
  z-index: 50;
}
.canvas-wrapper {
  display: flex;
  flex-direction: row;
  /*gap: 24px;*/
  gap: v-bind(actorGap + 'px');
  /*padding: 24px;*/
  padding: v-bind(padding + 'px');
  background-color: #f5f5f5;
  overflow-x: auto;
  overflow-y: auto;
  height: 600px; /* 스크롤 생기게 하기 위한 제한 */
  position: relative; /* 꼭 필요함! */
  border: 2px dashed red; /* 테스트용 */
  padding-top: 32px; /* 헤더가 덮이지 않도록 위 공간 확보 */
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

  position: sticky;
  top: 0;
  background-color: white;
  z-index: 5;
  padding: 4px;
  font-weight: bold;
  text-align: center;
  border-bottom: 1px solid #ccc;
}

.canvas-header {
  display: flex;
  position: sticky;
  top: 0;
  z-index: 10;
  background-color: #fff;
  border-bottom: 1px solid #ccc;
}

.point-container {
  display: flex;
  flex-direction: column;
  /*gap: 16px;*/
  gap: v-bind(pointGap + 'px');
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

.svg-message-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  min-height: 100%;
  pointer-events: none;
  z-index: 10;
  padding: v-bind(padding + 'px');
}
</style>
