<template>
  <div class="sequence-canvas">
    <!-- Actor Header -->
    <div class="actors">
      <div
        v-for="actor in actors"
        :key="actor.id"
        class="actor-box"
      >
        {{ actor.name }}
      </div>
    </div>
    <v-btn
  variant="outlined"
  size="small"
  class="mt-4"
  v-if="actors.length >= 2"
  @click="$emit('connect-message', actors[0].id, actors[1].id)"
>
  메시지 연결 테스트 (0→1)
</v-btn>
    <!-- 메시지 영역 -->
    <div class="messages">
      <div
        v-for="message in messages"
        :key="message.id"
        class="message-row"
        @dblclick="$emit('double-click-message', message.id)"
      >
        <span class="from">{{ getActorName(message.from) }}</span>
        →
        <span class="to">{{ getActorName(message.to) }}</span>
        <span class="name">({{ message.name }})</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Actor, Message } from '@/stores/project'

const { actors, messages } = defineProps<{
  actors: Actor[]
  messages: Message[]
}>()

defineEmits<{
  (e: 'double-click-message', messageId: string): void
  (e: 'connect-message', fromId: string, toId: string): void
}>()

// 유틸: actor 이름 가져오기
const getActorName = (id: string) => {
  const actor = actors.find((a) => a.id === id)
  return actor ? actor.name : 'Unknown'
}
</script>

<style scoped>
.sequence-canvas {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.actors {
  display: flex;
  gap: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid #ccc;
}

.actor-box {
  padding: 8px 12px;
  background-color: #e0e0e0;
  border-radius: 8px;
  min-width: 100px;
  text-align: center;
  font-weight: 500;
}

.messages {
  padding-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.message-row {
  padding: 4px 8px;
  background-color: #f5f5f5;
  border-left: 4px solid #1976d2;
  cursor: pointer;
  transition: background 0.2s;
}

.message-row:hover {
  background-color: #e3f2fd;
}

.from, .to, .name {
  margin-right: 8px;
}
</style>
