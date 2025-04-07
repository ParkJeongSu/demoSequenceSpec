<template>
  <div class="d-flex align-center justify-space-between">
    <div class="d-flex gap-4">
      <v-chip
        v-for="actor in actors"
        :key="actor.id"
        color="primary"
        variant="outlined"
      >
        {{ actor.name }}
      </v-chip>
    </div>

    <div>
      <v-btn icon @click="$emit('add-actor')">
        <v-icon>mdi-plus</v-icon>
      </v-btn>
      <v-btn icon @click="$emit('remove-actor')">
        <v-icon>mdi-minus</v-icon>
      </v-btn>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Actor } from '@/stores/project'

defineProps<{
  actors: Actor[]
}>()

defineEmits<{
  (e: 'add-actor'): void
  (e: 'remove-actor'): void
}>()
</script>

<style scoped>
.gap-4 {
  gap: 16px;
}
</style>
