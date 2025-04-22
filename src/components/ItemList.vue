<template>
  <v-list-item
    v-for="item in items"
    :key="item.id"
    :active="item.id === selectedItemId"
    @click="$emit('select-item', item.id)"
  >
    <v-list-item-content>
      <v-list-item-title>{{ item.title }}</v-list-item-title>
    </v-list-item-content>
    <v-list-item-action>
      <v-btn icon @click.stop="$emit('delete-item', item.id)">
        <v-icon>mdi-delete</v-icon>
      </v-btn>
    </v-list-item-action>
  </v-list-item>

  <v-btn block class="mt-2" @click="$emit('add-item')">
    <v-icon left>mdi-plus</v-icon>
    Add Item
  </v-btn>
</template>

<script setup lang="ts">
import type { Item } from '@/stores/project'

defineProps<{
  items: Item[]
  selectedItemId: string
}>()

defineEmits<{
  (e: 'select-item', id: string): void
  (e: 'delete-item', id: string): void
  (e: 'add-item'): void
}>()
</script>
