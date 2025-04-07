<template>
  <v-navigation-drawer app permanent width="300">
    <v-list dense>

      <!-- 그룹 목록 -->
      <v-subheader>그룹</v-subheader>
      <GroupList
        :groups="groups"
        :selectedGroupId="selectedGroupId"
        @select-group="selectGroup"
        @delete-group="deleteGroup"
        @add-group="addGroup"
      />

      <v-divider class="my-2" />

      <!-- 항목 목록 -->
      <v-subheader>항목</v-subheader>
      <ItemList
        v-if="selectedGroup"
        :items="selectedGroup.items"
        :selectedItemId="selectedItemId"
        @select-item="selectItem"
        @delete-item="deleteItem"
        @add-item="addItem"
      />

    </v-list>
  </v-navigation-drawer>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useProjectStore } from '@/stores/project'
import GroupList from './GroupList.vue'
import ItemList from './ItemList.vue'

const store = useProjectStore()

const groups = computed(() => store.groups)
const selectedGroupId = computed(() => store.selectedGroupId)
const selectedItemId = computed(() => store.selectedItemId)
const selectedGroup = computed(() => store.selectedGroup)

// 이벤트 핸들러
const selectGroup = (groupId: string) => {
  store.selectedGroupId = groupId
  store.selectedItemId = ''
}

const addGroup = () => store.addGroup()
const deleteGroup = (groupId: string) => store.removeGroup(groupId)

const selectItem = (itemId: string) => {
  store.selectedItemId = itemId
}

const addItem = () => {
  if (store.selectedGroupId) {
    store.addItemToGroup(store.selectedGroupId)
  }
}

const deleteItem = (itemId: string) => {
  if (store.selectedGroupId) {
    store.removeItemFromGroup(store.selectedGroupId, itemId)
  }
}
</script>
