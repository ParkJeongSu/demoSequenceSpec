<template>
  <v-list-item
    v-for="group in groups"
    :key="group.id"
    :active="group.id === selectedGroupId"
    @click="$emit('select-group', group.id)"
  >
    <v-list-item-content>
      <v-list-item-title>{{ group.name }}</v-list-item-title>
    </v-list-item-content>
    <v-list-item-action>
      <v-btn icon @click.stop="$emit('delete-group', group.id)">
        <v-icon>mdi-delete</v-icon>
      </v-btn>
    </v-list-item-action>
  </v-list-item>

  <v-btn block class="mt-2" @click="$emit('add-group')">
    <v-icon left>mdi-plus</v-icon>
    Add Group
  </v-btn>
</template>

<script setup lang="ts">
import type { Group } from '@/stores/project'

defineProps<{
  groups: Group[]
  selectedGroupId: string
}>()

defineEmits<{
  (e: 'select-group', id: string): void
  (e: 'delete-group', id: string): void
  (e: 'add-group'): void
}>()
</script>
