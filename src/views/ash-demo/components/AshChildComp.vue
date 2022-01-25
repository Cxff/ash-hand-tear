<template>
  <div>
    <h2>AshChildComp组件</h2>
    <div class="header-region">
      <slot name="header"></slot>
    </div>
    <hr>
    <p @click="sendFatherFn">父组件的数据: {{ props.msg }}</p>
    <p @click="changeChildFn">子组件数据: 我叫{{ modelValue }}, 今年{{ age }}</p>
  </div>
</template>

<script setup>
import { useAttrs } from "vue";

const props = defineProps({
  msg: String,
  modelValue: String, // v-mode默认值
  age: Number
})
const emit = defineEmits([ 'sendFather', 'update:modelValue', 'update:age' ])
const sendFatherFn = () => {
  emit('sendFather', '我是child来的')
}

const changeChildFn = () => {
  emit('update:modelValue', '小灰灰')
  emit('update:age', 25)
}

const attrs = useAttrs()
console.log('attrs==>', attrs);
</script>

<style lang="scss">
.header-region {
  border: 1px solid #ccc;
  padding: 10px;
}
</style>