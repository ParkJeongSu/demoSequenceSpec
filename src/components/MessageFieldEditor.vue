<template>
  <div class="field-block">
    <v-row class="mb-1">
      <v-col cols="4"><v-text-field v-model="field.name" label="필드명" dense /></v-col>
      <v-col cols="4"><v-text-field v-model="field.type" label="타입" dense /></v-col>
      <v-col cols="4" class="d-flex align-center">
        <v-text-field v-model="field.desc" label="설명" dense />
        <v-btn icon @click="$emit('add-child', field)">
          <v-icon size="small">mdi-subdirectory-arrow-right</v-icon>
        </v-btn>
        <v-btn icon @click="$emit('remove', field)">
          <v-icon size="small">mdi-delete</v-icon>
        </v-btn>
      </v-col>
    </v-row>

    <!-- 자식 필드 재귀 렌더링 -->
    <div class="child-fields ml-4" v-if="field.fields">
      <MessageFieldEditor
        v-for="(child, i) in field.fields"
        :key="i"
        :field="child"
        @add-child="$emit('add-child', $event)"
        @remove="$emit('remove', $event)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { MessageField } from '@/stores/project'

defineProps<{
  field: MessageField
}>()

defineEmits<{
  (e: 'add-child', parent: MessageField): void
  (e: 'remove', target: MessageField): void
}>()
</script>

<style scoped>
.child-fields {
  border-left: 2px dotted #ccc;
  padding-left: 8px;
}
</style>
