<template>
  <v-app>
    <!-- 툴바 -->
    <v-app-bar app color="primary" dark>
      <v-toolbar-title>Sequence Spec Editor</v-toolbar-title>

      <v-spacer />

      <!-- 저장 / 불러오기 버튼 -->
      <v-btn @click="save" variant="outlined" size="small">
        <v-icon left>mdi-content-save</v-icon>
        save
      </v-btn>
      <v-btn @click="load" variant="outlined" size="small" class="ml-2">
        <v-icon left>mdi-folder-open</v-icon>
        loadFromFile
      </v-btn>
    </v-app-bar>
    <!-- 메인 레이아웃 -->
    <v-container fluid class="main-container pa-0 d-flex"
      ><!-- fill-height -->
      <!-- 좌측: 사이드바 -->
      <SidebarGroupManager />

      <!-- 메인 콘텐츠 -->
      <v-main class="main-content">
        <SequenceEditor />
      </v-main>
    </v-container>
  </v-app>
</template>

<script setup lang="ts">
import SidebarGroupManager from './components/SidebarGroupManager.vue'
import SequenceEditor from './components/SequenceEditor.vue'
import { useProjectStore } from './stores/project'

const store = useProjectStore()

const save = () => {
  store.saveToFile()
}

const load = () => {
  store.loadFromFile()
}
</script>

<style scoped>
.main-container {
  height: calc(100vh - 64px); /* AppBar 높이 제외 */
  display: flex;
  position: relative;
}

.sidebar {
  width: 280px;
  border-right: 1px solid #ddd;
  background-color: #f9f9f9;
  overflow-y: auto;
}

.main-content {
  flex: 1;
  background-color: #fafafa;
  overflow-y: auto;
  height: 100%; /* 혹시 fill-height가 의도대로 작동하지 않으면 */
}
</style>
