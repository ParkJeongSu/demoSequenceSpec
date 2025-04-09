<template>
  <div v-if="sequence" class="pa-4 fill-height d-flex flex-column">

    <!-- 오브젝트 헤더 -->
    <ActorHeader :actors="sequence.actors" @add-actor="addActor" @remove-actor="removeActor" />

    <v-divider class="my-2" />

    <!-- 시퀀스 캔버스 (메시지 연결 영역) -->
    <SequenceCanvas
      :actors="sequence.actors"
      :messages="sequence.messages"

      @double-click-message="editMessage"
    />
    <!-- @connect-message="connectMessage" -->

    <!-- 메시지 스펙 팝업 -->
    <MessageSpecEditor
      v-if="editingMessage"
      :message="editingMessage"
      @update-message="updateMessage"
      @close-editor="editingMessage = null"
    />
  </div>

  <div v-else class="pa-4 text-grey">항목을 선택해주세요.</div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useProjectStore } from '@/stores/project'
import ActorHeader from './ActorHeader.vue'
import SequenceCanvas from './SequenceCanvas.vue'
import MessageSpecEditor from './MessageSpecEditor.vue'
import type { Actor, Message } from '@/stores/project'
import type { Point } from '@/stores/project' // Point 타입도 import 필요

const store = useProjectStore()
const sequence = computed(() => store.currentSequence)

const editingMessage = ref<Message | null>(null)

// Actor 추가
const addActor = () => {
  if (sequence.value) {
    sequence.value.actors.push({
      id: crypto.randomUUID(),
      name: `Actor ${sequence.value.actors.length + 1}`,
      points: [] as Point[], // ← 여기를 추가!
    })
    store.markChanged()
  }
}

// Actor 삭제
const removeActor = () => {
  if (sequence.value && sequence.value.actors.length > 0) {
    sequence.value.actors.pop()
    store.markChanged()
  }
}

// 메시지 연결
// const connectMessage = (fromId: string, toId: string) => {
//   if (sequence.value) {
//     sequence.value.messages.push({
//       id: crypto.randomUUID(),
//       fromActorId: fromId,
//       fromPoint: toId,
//       toActorId: fromId,
//       toPoint: toId,
//       spec: {
//         description: '',
//         fields: [],
//       },
//     })
//     store.markChanged()
//   }
// }

// 메시지 수정
const editMessage = (messageId: string) => {
  console.log('더블클릭한 메시지 ID:', messageId)
  editingMessage.value = sequence.value?.messages.find((m) => m.id === messageId) || null
  console.log('선택된 메시지:', editingMessage.value)
}

// 메시지 업데이트
const updateMessage = (msg: Message) => {
  if (!sequence.value) return
  const index = sequence.value.messages.findIndex((m) => m.id === msg.id)
  if (index >= 0) {
    sequence.value.messages[index] = msg
    store.markChanged()
  }
  editingMessage.value = null
}
</script>
