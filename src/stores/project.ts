import { defineStore } from 'pinia'
import { nanoid } from 'nanoid'

// 데이터 타입 정의
export interface MessageField {
  name: string
  type: string
  desc: string
}

export interface MessageSpec {
  description: string
  fields: MessageField[]
}

export interface Message {
  id: string
  from: string
  to: string
  name: string
  spec: MessageSpec
}

export interface Actor {
  id: string
  name: string
}

export interface Sequence {
  actors: Actor[]
  messages: Message[]
}

export interface Item {
  id: string
  title: string
  sequence: Sequence
}

export interface Group {
  id: string
  name: string
  items: Item[]
}

// 스토어 정의
export const useProjectStore = defineStore('project', {
  state: () => ({
    groups: [] as Group[],
    selectedGroupId: '',
    selectedItemId: '',
    fileName: '',
    isSaved: true,
  }),

  getters: {
    selectedGroup(state): Group | undefined {
      return state.groups.find((g) => g.id === state.selectedGroupId)
    },
    selectedItem(state): Item | undefined {
      return this.selectedGroup?.items.find((i) => i.id === state.selectedItemId)
    },
    currentSequence(state): Sequence | undefined {
      return this.selectedItem?.sequence
    },
  },

  actions: {
    addGroup() {
      const newGroup: Group = {
        id: nanoid(),
        name: `그룹 ${this.groups.length + 1}`,
        items: [],
      }
      this.groups.push(newGroup)
      this.selectedGroupId = newGroup.id
      this.selectedItemId = ''
      this.isSaved = false
    },

    removeGroup(groupId: string) {
      this.groups = this.groups.filter((g) => g.id !== groupId)
      if (this.selectedGroupId === groupId) {
        this.selectedGroupId = ''
        this.selectedItemId = ''
      }
      this.isSaved = false
    },

    addItemToGroup(groupId: string) {
      const group = this.groups.find((g) => g.id === groupId)
      if (!group) return
      const newItem: Item = {
        id: nanoid(),
        title: `항목 ${group.items.length + 1}`,
        sequence: {
          actors: [],
          messages: [],
        },
      }
      group.items.push(newItem)
      this.selectedItemId = newItem.id
      this.isSaved = false
    },

    removeItemFromGroup(groupId: string, itemId: string) {
      const group = this.groups.find((g) => g.id === groupId)
      if (!group) return
      group.items = group.items.filter((i) => i.id !== itemId)
      if (this.selectedItemId === itemId) {
        this.selectedItemId = ''
      }
      this.isSaved = false
    },

    setSaved(filename: string) {
      this.fileName = filename
      this.isSaved = true
    },

    markChanged() {
      this.isSaved = false
    },
  },
})
