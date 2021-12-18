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


// window.onerror = function (e) {
//     console.log(['https://stackoverflow.com/search?q=[js]+'+e])
//   }