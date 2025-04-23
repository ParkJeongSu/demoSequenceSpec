<template>
  <v-dialog v-model="dialog" persistent max-width="1000px">
    <v-card>
      <v-card-title>Modify Message Spec</v-card-title>

      <v-card-text>
        <v-row>
          <v-col cols="6">
            <v-text-field label="Message Name" v-model="form.messageName" required />
            <v-textarea label="Description" v-model="form.description" rows="3" />

            <v-divider class="my-4" />

            <div>
              <v-subheader>FieldList</v-subheader>
              <MessageFieldEditor
                v-for="(field, i) in form.fields"
                :key="i"
                :field="field"
                @add-child="addChildField"
                @remove="removeField"
              />
              <v-btn @click="addField" variant="outlined" size="small">
                <v-icon left>mdi-plus</v-icon>
                Add Field
              </v-btn>
            </div>
          </v-col>
          <v-col cols="6">
            <v-select label="Format" v-model="form.format" :items="['json', 'xml', 'text']" />
            <v-textarea label="Preview Spec" :model-value="generatedPreview" readonly rows="12" />
          </v-col>
        </v-row>
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn text @click="$emit('delete', props.messageId)">remove Message</v-btn>
        <v-btn text @click="$emit('close-editor')">Cancel</v-btn>
        <v-btn color="primary" @click="save">Save</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import type { Ref } from 'vue'
import type { MessageField } from '@/stores/project'
import type { MessageSpec } from '@/stores/project'
import MessageFieldEditor from './MessageFieldEditor.vue'

const props = defineProps<{
  message: MessageSpec
  messageId: string
}>()

const emit = defineEmits<{
  (e: 'update-spec', spec: MessageSpec): void
  (e: 'close-editor'): void
  (e: 'delete', id: string): void
}>()

// 다이얼로그 제어
const dialog = ref(true)

// 로컬 상태로 복사 (편집용)
const form: Ref<MessageSpec> = ref(JSON.parse(JSON.stringify(props.message)))

// 필드 추가/삭제
const addField = () => {
  const newField: MessageField = { name: '', type: '', desc: '' }
  form.value?.fields.push(newField)
}

// 저장 처리
const save = () => {
  emit('update-spec', form.value)
  dialog.value = false
}

const generatedPreview = computed(() => {
  if (form.value.format === 'json') {
    return JSON.stringify(formatAsJson(form.value.fields), null, 2)
  } else if (form.value.format === 'xml') {
    return formatAsXml(form.value.fields)
  } else {
    return '미리보기가 지원되지 않는 포맷입니다.'
  }
})

function formatAsJson(fields: MessageField[]): any {
  const obj: any = {}
  for (const f of fields) {
    obj[f.name] = f.fields?.length ? formatAsJson(f.fields) : f.type
  }
  return obj
}

function formatAsXml(fields: MessageField[], indent = ''): string {
  return fields
    .map((f) => {
      if (f.fields?.length) {
        return `${indent}<${f.name}>\n${formatAsXml(f.fields, indent + '  ')}\n${indent}</${f.name}>`
      } else {
        return `${indent}<${f.name}>${f.type}</${f.name}>`
      }
    })
    .join('\n')
}

function addChildField(parent: MessageField) {
  if (!parent.fields) parent.fields = []
  parent.fields.push({ name: '', type: '', desc: '', fields: [] })
}

function removeField(target: MessageField) {
  const recursiveRemove = (arr: MessageField[]) => {
    const index = arr.indexOf(target)
    if (index !== -1) return arr.splice(index, 1)

    for (const f of arr) {
      if (f.fields) recursiveRemove(f.fields)
    }
  }

  recursiveRemove(form.value.fields)
}
</script>
