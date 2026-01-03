import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import en from 'element-plus/es/locale/lang/en'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'

import App from './App.vue'
import router from './router'
import i18n, { getLocale } from './locales'
import './styles/index.scss'

const app = createApp(App)

// 注册所有图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

// 根据当前语言设置 Element Plus 语言
const elementLocale = getLocale() === 'zh-CN' ? zhCn : en

app.use(createPinia())
app.use(router)
app.use(i18n)
app.use(ElementPlus, { size: 'default', zIndex: 3000, locale: elementLocale })

app.mount('#app')
