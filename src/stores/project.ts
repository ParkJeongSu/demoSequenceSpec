import { defineStore } from 'pinia'
import { nanoid } from 'nanoid'
import { nextTick } from 'vue'

// 데이터 타입 정의
export interface MessageField {
  name: string
  type: string
  desc: string
  fields?: MessageField[] // ← 재귀로 중첩 가능하게
}

export interface MessageSpec {
  messageName: string
  description: string
  format: 'json' | 'xml' | 'text' // ← 포맷 추가
  fields: MessageField[]
}

export interface Message {
  id: string
  fromActorId: string
  fromLogicalY: number
  toActorId: string
  toLogicalY: number
  spec?: MessageSpec
}

export interface Actor {
  id: string
  name: string
}

export interface MemoBlockData {
  id: string
  x: number
  y: number
  width: number
  height: number
  text: string
  saved: boolean
}

export interface Sequence {
  actors: Actor[]
  messages: Message[]
  memoBlocks: MemoBlockData[]
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
        name: `Group ${this.groups.length + 1}`,
        items: [],
      }
      this.groups.push(newGroup)
      this.selectedGroupId = newGroup.id
      this.selectedItemId = ''
      this.isSaved = false
    },
    selectGroup(id: string) {
      this.selectedGroupId = ''
      nextTick(() => {
        this.selectedGroupId = id
      })
    },
    selectItem(id: string) {
      this.selectedItemId = ''
      nextTick(() => {
        this.selectedItemId = id
      })
    },

    deleteGroup(id: string) {
      const isCurrentGroup = this.selectedGroupId === id

      this.groups = this.groups.filter((g) => g.id !== id)

      if (isCurrentGroup) {
        this.selectedGroupId = ''
        this.selectedItemId = ''
      }
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
        title: `Item ${group.items.length + 1}`,
        sequence: {
          actors: [],
          messages: [],
          memoBlocks: [],
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
    savedChanged() {
      this.isSaved = !this.isSaved
    },

    updateGroupName(groupId: string, newName: string) {
      const group = this.groups.find((g) => g.id === groupId)
      if (group) {
        group.name = newName.trim()
      }
    },

    updateItemName(groupId: string, itemId: string, newName: string) {
      const group = this.groups.find((g) => g.id === groupId)
      if (group) {
        const item = group.items.find((i) => i.id === itemId)
        if (item) {
          item.title = newName.trim()
        }
      }
    },
    updateActorName(actorId: string, newName: string) {
      const actor = this.currentSequence?.actors.find((a) => a.id === actorId)
      if (actor) {
        actor.name = newName.trim()
      }
    },
    removeMessage(messageId: string) {

      const currentSequence = this.currentSequence

      if (!currentSequence) return

      const newMessages = this.currentSequence?.messages.filter((i) => i.id !== messageId) || []

      currentSequence.messages = [...newMessages]

      // if (this.selectedGroupId && this.selectedItemId) {
      //   const group = this.groups.find((g) => g.id === this.selectedGroupId)
      //   const item = group?.items.find((i) => i.id === this.selectedItemId)
      //   if (item) {
      //     item.sequence.messages = [...newMessages]
      //   }
      // }

      // if(this.selectedItem){
      //   this.selectedItem.sequence = {
      //     ...this.selectedItem.sequence,
      //     messages: [...newMessages],
      //   }
      // }

      this.markChanged()
      this.savedChanged()
    },
    async saveToFile() {
      if (!window.electronAPI?.saveToFile) {
        console.error('[store] Electron API가 준비되지 않았습니다.')
        return
      }

      const pureData = JSON.parse(
        JSON.stringify({
          groups: this.groups,
          selectedGroupId: this.selectedGroupId,
          selectedItemId: this.selectedItemId,
        }),
      )

      const result = await window.electronAPI.saveToFile(pureData)

      if (result.success) {
        this.isSaved = true
        console.log('[store] 저장 성공:', result.path)
      } else {
        console.error('[store] 저장 실패:', result.error)
      }
    },

    async loadFromFile() {
      if (!window.electronAPI?.loadFromFile) {
        console.error('[store] Electron API가 준비되지 않았습니다.')
        return
      }

      const result = await window.electronAPI.loadFromFile()

      if (result.success && result.data) {
        this.groups = result.data.groups || []
        this.selectedGroupId = result.data.selectedGroupId || ''
        this.selectedItemId = result.data.selectedItemId || ''
        this.isSaved = true
        console.log('[store] 불러오기 성공')
      } else {
        console.warn('[store] 불러오기 실패:', result.error)
      }
    },
  },
})
