<template>
  <div v-if="sequence" class="pa-4 fill-height d-flex flex-column">
    <!-- 오브젝트 헤더 -->
    <ActorHeader :actors="sequence.actors" @add-actor="addActor" @remove-actor="removeActor" />

    <v-divider class="my-2" />

    <!-- 시퀀스 캔버스 (메시지 연결 영역) -->
    <SequenceCanvas
      :actors="sequence.actors"
      :messages="sequence.messages"
      @connect-message="connectMessage"
      @double-click-message="editMessage"
    />
    <!-- -->

    <!-- 메시지 스펙 팝업 -->
    <MessageSpecEditor
      v-if="editingMessage && editingMessage.spec"
      :message="editingMessage.spec"
      @update-spec="updateMessage"
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
import type { Message, MessageSpec } from '@/stores/project'

const store = useProjectStore()
const sequence = computed(() => store.currentSequence)

const editingMessage = ref<Message | null>(null)
// Actor 추가
const addActor = () => {
  if (sequence.value) {
    sequence.value.actors.push({
      id: crypto.randomUUID(),
      name: `Actor ${sequence.value.actors.length + 1}`,
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
const connectMessage = (
  from: { actorId: string; logicalY: number },
  to: { actorId: string; logicalY: number },
) => {
  if (sequence.value) {
    sequence.value.messages.push({
      id: crypto.randomUUID(),
      fromActorId: from.actorId,
      fromLogicalY: from.logicalY,
      toActorId: to.actorId,
      toLogicalY: to.logicalY,
      spec: {
        messageName: '',
        description: '',
        fields: [],
      },
    })
    store.markChanged()
  }
}

// 메시지 수정
const editMessage = (messageId: string) => {
  console.log('더블클릭한 메시지 ID:', messageId)
  editingMessage.value = sequence.value?.messages.find((m) => m.id === messageId) || null
  console.log('선택된 메시지:', editingMessage.value)
}

// 메시지 업데이트
const updateMessage = (updatedSpec: MessageSpec) => {
  if (!sequence.value || !editingMessage.value) return

  const index = sequence.value.messages.findIndex((m) => m.id === editingMessage.value!.id)
  if (index >= 0) {
    sequence.value.messages[index].spec = updatedSpec // ✅ spec만 교체
    store.markChanged()
  }

  editingMessage.value = null
}
</script>
