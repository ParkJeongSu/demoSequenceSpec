<template>
  <v-dialog v-model="dialog" persistent max-width="600px">
    <v-card>
      <v-card-title>메시지 스펙 편집</v-card-title>

      <v-card-text>
        <v-text-field label="메시지 이름" v-model="form.name" required />
        <v-textarea label="설명" v-model="form.spec.description" rows="3" />

        <v-divider class="my-4" />

        <div>
          <v-subheader>필드 목록</v-subheader>
          <v-row v-for="(field, index) in form.spec.fields" :key="index" class="mb-2">
            <v-col cols="4">
              <v-text-field v-model="field.name" label="필드명" dense />
            </v-col>
            <v-col cols="4">
              <v-text-field v-model="field.type" label="타입" dense />
            </v-col>
            <v-col cols="4" class="d-flex align-center">
              <v-text-field v-model="field.desc" label="설명" dense />
              <v-btn icon @click="removeField(index)">
                <v-icon>mdi-delete</v-icon>
              </v-btn>
            </v-col>
          </v-row>

          <v-btn @click="addField" variant="outlined" size="small">
            <v-icon left>mdi-plus</v-icon>
            필드 추가
          </v-btn>
        </div>
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn text @click="$emit('close-editor')">취소</v-btn>
        <v-btn color="primary" @click="save">저장</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { Message, MessageField } from '@/stores/project'

const props = defineProps<{
  message: Message
}>()

const emit = defineEmits<{
  (e: 'update-message', msg: Message): void
  (e: 'close-editor'): void
}>()

// 다이얼로그 제어
const dialog = ref(true)

// 로컬 상태로 복사 (편집용)
const form = ref<Message>(JSON.parse(JSON.stringify(props.message)))

// 필드 추가/삭제
const addField = () => {
  const newField: MessageField = { name: '', type: '', desc: '' }
  form.value.spec.fields.push(newField)
}

const removeField = (index: number) => {
  form.value.spec.fields.splice(index, 1)
}

// 저장 처리
const save = () => {
  emit('update-message', form.value)
  dialog.value = false
}
</script>
