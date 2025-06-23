import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import App from './App.vue'
import router from './router'
import pinia from './store'
import './style.css'
import './assets/styles/global.css'

// 只在开发环境下使用Mock数据，且通过环境变量控制
if (import.meta.env.DEV && import.meta.env.VITE_USE_MOCK === 'true') {
  import('./mock')
  console.log('Using mock data')
} else {
  console.log('Using real API')
}

const app = createApp(App)

app.use(ElementPlus, {
  locale: zhCn
})
app.use(router)
app.use(pinia)

app.mount('#app')
