<template>
  <div class="memo-block" :style="blockStyle" @mousedown.self="startDrag">
    <!-- 오른쪽 상단 버튼 -->
    <div class="memo-toolbar">
      <v-btn size="x-small" variant="text" @click="save">Save</v-btn>
      <v-btn size="x-small" variant="text" @click="remove">Del</v-btn>
    </div>

    <!-- 메모 텍스트 -->
    <textarea
      v-if="!memo.saved"
      v-model="localText"
      class="memo-textarea"
      @blur="save"
      @keydown.esc.prevent="remove"
    />
    <div v-else class="memo-content" @dblclick="enterEdit">
      {{ memo.text }}
    </div>

    <!-- 크기 조절 핸들 -->
    <div class="resize-handle" @mousedown.stop="startResize"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import type { MemoBlockData } from '@/stores/project'

const dragging = ref(false)
const offset = ref({ x: 0, y: 0 })

const resizing = ref(false)
const resizeStart = ref({ x: 0, y: 0 })
const sizeStart = ref({ width: 0, height: 0 })

const props = defineProps<{
  memo: MemoBlockData
}>()

const emit = defineEmits<{
  (e: 'update', updated: MemoBlockData): void
  (e: 'delete', id: string): void
}>()

const localText = ref(props.memo.text)

// 스타일 동기화
const blockStyle = computed(() => ({
  top: `${props.memo.y}px`,
  left: `${props.memo.x}px`,
  width: `${props.memo.width}px`,
  height: `${props.memo.height}px`,
}))

// 저장
function save() {
  emit('update', {
    ...props.memo,
    text: localText.value,
    saved: true,
  })
}

// 삭제
function remove() {
  emit('delete', props.memo.id)
}

// 다시 편집
function enterEdit() {
  emit('update', {
    ...props.memo,
    saved: false,
  })
}

function startDrag(e: MouseEvent) {
  console.log('[MemoBlock] 드래그 시작됨')
  dragging.value = true

  // 마우스 클릭 지점과 메모 좌상단 차이 기록
  offset.value = {
    x: e.clientX - props.memo.x,
    y: e.clientY - props.memo.y,
  }

  window.addEventListener('mousemove', onMouseMove)
  window.addEventListener('mouseup', onMouseUp)
}

function startResize(e: MouseEvent) {
  console.log('[MemoBlock] startResize 시작됨')
  resizing.value = true
  resizeStart.value = { x: e.clientX, y: e.clientY }
  sizeStart.value = { width: props.memo.width, height: props.memo.height }

  window.addEventListener('mousemove', onResizeMove)
  window.addEventListener('mouseup', onResizeEnd)
}

function onMouseMove(e: MouseEvent) {
  if (!dragging.value) return

  const newX = e.clientX - offset.value.x
  const newY = e.clientY - offset.value.y

  emit('update', {
    ...props.memo,
    x: newX,
    y: newY,
  })
}

function onMouseUp() {
  dragging.value = false
  window.removeEventListener('mousemove', onMouseMove)
  window.removeEventListener('mouseup', onMouseUp)
}

function onResizeMove(e: MouseEvent) {
  if (!resizing.value) return

  const dx = e.clientX - resizeStart.value.x
  const dy = e.clientY - resizeStart.value.y

  emit('update', {
    ...props.memo,
    width: Math.max(100, sizeStart.value.width + dx),
    height: Math.max(60, sizeStart.value.height + dy),
  })
}
function onResizeEnd() {
  resizing.value = false
  window.removeEventListener('mousemove', onResizeMove)
  window.removeEventListener('mouseup', onResizeEnd)
}

// 드래그/리사이즈 이벤트는 다음 단계에서 추가
</script>

<style scoped>
.memo-block {
  position: absolute;
  background-color: #fffde7;
  border: 1px solid #fbc02d;
  border-radius: 8px;
  box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
  padding: 8px;
  box-sizing: border-box;
  z-index: 20;
  cursor: move;
  user-select: none;
}

.memo-toolbar {
  position: absolute;
  top: 4px;
  right: 4px;
  display: flex;
  gap: 4px;
}

.memo-textarea {
  width: 100%;
  height: 100%;
  border: none;
  resize: none;
  outline: none;
  background: transparent;
  font-family: inherit;
  font-size: 14px;
}

.memo-content {
  white-space: pre-wrap;
  font-size: 14px;
  text-align: left;
}

.resize-handle {
  width: 12px;
  height: 12px;
  background: #fbc02d;
  border-radius: 3px;
  position: absolute;
  right: 2px;
  bottom: 2px;
  cursor: se-resize;
}
</style>
