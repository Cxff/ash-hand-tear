<template>
  <h4>Count: {{ count }}</h4>
  <div @click="addFn(1)">同步请求</div>
  <div @click="addFn(2)">异步请求</div>
</template>
<script setup>
import { computed } from 'vue';
import { useStore } from 'vuex';
// import { useStore } from '../store/ashVuex'
let store = useStore()

let count = computed(() => {
  // return store.state.count
  return store.getters.double
})
console.log(count)
console.log(store.state)
function addFn(type) {
  if (type == 1) {
    store.commit('addCount')
  } else {
    store.dispatch('asyncAdd')
  }
}
</script>
<style scoped>
</style>