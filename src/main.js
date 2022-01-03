/**
 * 如果不是以 / ./ ../ 开头的  认为他在node_modules中
 * 这时就要去node_modules中查找
 */

import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import App from './App.vue'
import store from './store'
import router from './router'

const app = createApp(App)
app
  .use(store)
  .use(router)
  .use(ElementPlus)
  .mount('#app')


/**
 * @todo
 * 1. 支持npm包的import
 * 2. 支持.vue单文件组件的解析
 * 3. 支持import css
 */
