<template>
  <v-list dense nav>
    <v-list-subheader>그룹 목록</v-list-subheader>

    <div v-for="group in store.groups" :key="group.id">
      <!-- 그룹 항목 -->
      <v-list-item :active="expandedGroupIds.includes(group.id)" @click="toggleGroup(group.id)">
        <v-list-item-title>{{ group.name }}</v-list-item-title>
      </v-list-item>

      <!-- 하위 항목 (펼쳐졌을 때만 보임) -->
      <div v-if="expandedGroupIds.includes(group.id)" class="ml-4">
        <v-list-item
          v-for="item in group.items"
          :key="item.id"
          :active="store.selectedItemId === item.id"
          @click="selectItem(group.id, item.id)"
        >
          <v-list-item-title>{{ item.title }}</v-list-item-title>
        </v-list-item>

        <!-- 아이템 추가 버튼 -->
        <v-btn small icon @click="addItem(group.id)">
          <v-icon size="small">mdi-plus</v-icon>
        </v-btn>
      </div>
    </div>

    <!-- 그룹 추가 버튼 -->
    <v-btn block variant="elevated" class="mt-2" @click="addGroup">
      <v-icon left>mdi-plus</v-icon> 그룹 추가
    </v-btn>
  </v-list>
</template>

<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'
import { useProjectStore } from '@/stores/project'
import GroupList from './GroupList.vue'
import ItemList from './ItemList.vue'

const store = useProjectStore()

const groups = computed(() => store.groups)
const selectedGroupId = computed(() => store.selectedGroupId)
const selectedItemId = computed(() => store.selectedItemId)
const selectedGroup = computed(() => store.selectedGroup)

const expandedGroupIds = ref<string[]>([]) // 현재 펼쳐진 그룹 ID 목록

// 이벤트 핸들러
const selectGroup = (groupId: string) => {
  store.selectedGroupId = groupId
  store.selectedItemId = ''
}

const addGroup = () => store.addGroup()
const deleteGroup = (groupId: string) => store.removeGroup(groupId)

const selectItem = (groupId: string, itemId: string) => {
  store.selectGroup(groupId)
  store.selectItem(itemId)
}

const deleteItem = (itemId: string) => {
  if (store.selectedGroupId) {
    store.removeItemFromGroup(store.selectedGroupId, itemId)
  }
}

function toggleGroup(id: string) {
  const i = expandedGroupIds.value.indexOf(id)
  if (i >= 0) {
    expandedGroupIds.value.splice(i, 1) // 닫기
  } else {
    expandedGroupIds.value.push(id) // 열기
  }
}

function addItem(groupId: string) {
  const group = store.groups.find((g) => g.id === groupId)
  if (!group) return

  store.addItemToGroup(groupId)
  store.markChanged()
}
</script>
