<template>
  <v-app>
    <v-layout class="fill-height">

      <!-- 좌측: 사이드바 -->
      <SidebarGroupManager />


      <!-- 메인 콘텐츠 -->
      <v-main class="main-content">
        <SequenceEditor />
      </v-main>

    </v-layout>
  </v-app>
</template>

<script setup lang="ts">
import SidebarGroupManager from './components/SidebarGroupManager.vue'
import SequenceEditor from './components/SequenceEditor.vue'
</script>

<style scoped>
.v-main {
  background-color: #fafafa;
  height: 100vh;
  overflow: auto;
}
.main-content {
  background-color: #fafafa;
  height: 100vh;
  overflow: auto;
}
</style>
