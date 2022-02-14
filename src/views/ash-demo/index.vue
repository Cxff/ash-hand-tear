<template>
  <FilesUpload></FilesUpload>
  <!--  <div>-->
  <!--    <h3>当前是ash-demo界面</h3>-->
  <!--    <hr>-->
  <!--    <h4>大文件上传: </h4>-->
  <!--    -->
  <!--    <hr>-->
  <!--    <AshChildComp class="ash-child-comp"-->
  <!--                  :msg="msg"-->
  <!--                  @sendFather="sendFather"-->
  <!--                  v-model="state.name"-->
  <!--                  v-model:age="state.age"-->
  <!--    >-->
  <!--      <template #header>-->
  <!--        <p>这个是 slot内容</p>-->
  <!--      </template>-->
  <!--    </AshChildComp>-->
  <!--    <hr>-->
  <!--    <p>refAsh: {{ refAsh }}</p>-->
  <!--    <button @click="changeName">修改名称</button>-->
  <!--    <p>state: {{ name }}今年{{ age }}岁, 翻一倍是{{ doubleAge }}</p>-->
  <!--  </div>-->
</template>

<script setup>
import { computed, reactive, ref, toRefs, watch } from 'vue'
import AshChildComp from "./components/AshChildComp.vue";
import FilesUpload from "./components/FilesUpload.vue";

const msg = '小灰'

const refAsh = ref('这个是ref数据')
const state = reactive({
  name: '小ash',
  age: 18
})

const doubleAge = computed(() => {
  return state.age * 2
})

const changeName = () => {
  state.name = 'SamllAsh'
  state.age += 2
}

// 监听
watch(
    () => state.age,
    (newVal, oldVal) => {
      console.log(`watch监听变化前的数据: ${ oldVal }`);
      console.log(`watch监听变化后的数据: ${ newVal }`);
    }
)

const { name, age } = toRefs(state)

const sendFather = (data) => {
  console.log(`子组件接收的数据==>${ data }`);
}

defineExpose({
  msg,
  refAsh
})
</script>

<style scoped>

</style>