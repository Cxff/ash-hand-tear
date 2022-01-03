<template>
  <div v-for="(item, index) in todos">
    <input type="checked" v-model="item.done" />
    <h3>{{ item.title }}</h3>
  </div>
</template>
<script setup lang="ts">
import { computed, reactive, ref, Ref } from '@vue/runtime-core'

interface Todo {
  title: string,
  done: false
}
let todos: Ref<Todo[]> = ref([{ title: '学习Vue3', done: false }])
</script>
<style scoped>
</style>