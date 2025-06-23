import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import App from './App.vue'
import router from './router'
import pinia from './store'
import './style.css'
import './assets/styles/global.css'

// 引入Mock数据（生产环境下可以注释掉）
import './mock'

const app = createApp(App)

app.use(ElementPlus, {
  locale: zhCn
})
app.use(router)
app.use(pinia)

app.mount('#app')
