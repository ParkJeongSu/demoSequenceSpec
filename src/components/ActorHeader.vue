<template>
  <div class="d-flex align-center justify-space-between">
    <div>
      <v-btn icon @click="$emit('add-actor')">
        <v-icon>mdi-plus</v-icon>
      </v-btn>
      <v-btn icon @click="$emit('remove-actor')">
        <v-icon>mdi-minus</v-icon>
      </v-btn>
      <v-btn icon @click="addMemoBlock">
      <v-icon>mdi-note-plus</v-icon> <!-- 메모 추가 아이콘 -->
    </v-btn>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Actor } from '@/stores/project'
import { useProjectStore } from '@/stores/project'
import { nanoid } from 'nanoid'

const store = useProjectStore()

defineProps<{
  actors: Actor[]
}>()

defineEmits<{
  (e: 'add-actor'): void
  (e: 'remove-actor'): void
}>()

const addMemoBlock = () => {
  const seq = store.currentSequence
  if (!seq) return

  seq.memoBlocks.push({
    id: nanoid(),
    x: 400,
    y: 400,
    width: 200,
    height: 120,
    text: '',
    saved: false,
  })
  store.markChanged()
}
</script>

<style scoped>
.gap-4 {
  gap: 16px;
}
</style>
