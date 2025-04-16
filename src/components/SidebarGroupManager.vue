<template>
  <v-list class="sidebar" dense nav>
    <v-list-subheader>group List</v-list-subheader>
    <div class="d-flex align-center justify-space-between">
      <div>
        <!-- 그룹 추가 버튼 -->
        <v-btn block variant="elevated" class="mt-2 add-group-btn" @click="addGroup">
          <v-icon left>mdi-plus</v-icon> 그룹 추가
        </v-btn>
      </div>
    </div>
    <div v-for="group in store.groups" :key="group.id">
      <!-- 그룹 항목 -->
      <v-list-item :active="expandedGroupIds.includes(group.id)" @click="toggleGroup(group.id)">
        <template #title>
          <!-- 편집 중이면 입력창 -->
          <v-text-field
            v-if="editingGroupId === group.id"
            v-model="editingName"
            dense
            hide-details
            variant="solo"
            autofocus
            @blur="onBlur(group)"
            @keydown.enter="finishEdit(group)"
            @keydown.esc="cancelEdit"
          />

          <!-- 편집 중이 아니면 텍스트 -->
          <span v-else @dblclick="startEdit(group)">
            {{ group.name }}
          </span>
        </template>
        <template #append>
          <v-btn icon size="x-small" @click.stop="deleteGroup(group.id)">
            <v-icon size="small">mdi-close</v-icon>
          </v-btn>
        </template>
      </v-list-item>

      <!-- 하위 항목 (펼쳐졌을 때만 보임) -->
      <div v-if="expandedGroupIds.includes(group.id)" class="ml-4">
        <v-list-item
          v-for="item in group.items"
          :key="item.id"
          :active="store.selectedItemId === item.id"
          @click="selectItem(group.id, item.id)"
        >
          <template #title>
            <!-- 편집 중이면 입력창 -->
            <v-text-field
              v-if="editingItemId === item.id"
              v-model="editingItemName"
              dense
              hide-details
              variant="solo"
              autofocus
              @blur="onBlur(group, item)"
              @keydown.enter="finishItemEdit(group, item)"
              @keydown.esc="cancelItemEdit"
            />

            <!-- 편집 중이 아니면 텍스트 -->
            <span v-else @dblclick="startItemEdit(item)">
              {{ item.title }}
            </span>
          </template>
          <template #append>
            <v-btn icon size="x-small" @click.stop="deleteItem(item.id)">
              <v-icon size="small">mdi-close</v-icon>
            </v-btn>
          </template>
        </v-list-item>

        <!-- 아이템 추가 버튼 -->
        <v-btn small icon @click="addItem(group.id)">
          <v-icon size="small">mdi-plus</v-icon>
        </v-btn>
      </div>
    </div>
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

const editingGroupId = ref<string | null>(null)
const editingName = ref('')

const editingItemId = ref<string | null>(null)
const editingItemName = ref('')

let skipBlur = false

// 이벤트 핸들러
const selectGroup = (groupId: string) => {
  store.selectedGroupId = groupId
  store.selectedItemId = ''
}

const addGroup = () => store.addGroup()
const deleteGroup = (groupId: string) => store.deleteGroup(groupId)

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

function startEdit(group: Group) {
  editingGroupId.value = group.id
  editingName.value = group.name
}

function finishEdit(group: Group) {
  skipBlur = true
  store.updateGroupName(group.id, editingName.value)
  editingGroupId.value = null
  editingName.value = ''
  store.markChanged?.() // 선택사항
}

function onBlur(group: Group) {
  if (skipBlur) {
    skipBlur = false
    return
  }
  finishEdit(group)
}

function cancelEdit() {
  skipBlur = true
  editingGroupId.value = null
  editingName.value = ''
}

function startItemEdit(Item: Item) {
  editingItemId.value = Item.id
  editingItemName.value = Item.title
}

function finishItemEdit(group: Group, Item: Item) {
  skipBlur = true
  store.updateItemName(group.id, Item.id, editingItemName.value)
  editingItemId.value = null
  editingItemName.value = ''
  store.markChanged?.() // 선택사항
}

function onBlurItem(group: Group, Item: Item) {
  if (skipBlur) {
    skipBlur = false
    return
  }
  finishItemEdit(group, Item)
}

function cancelItemEdit() {
  skipBlur = true
  editingItemId.value = null
  editingItemName.value = ''
}
</script>

<style scoped>
.sidebar {
  padding-top: 64px;
  overflow-x: hidden;
}

.add-group-btn {
  width: 100%;
}

span {
  cursor: pointer;
}
</style>
