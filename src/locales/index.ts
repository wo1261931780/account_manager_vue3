import { createI18n } from 'vue-i18n'
import zhCN from './zh-CN'
import enUS from './en-US'

// 获取浏览器语言或本地存储的语言设置
function getDefaultLocale(): string {
  // 优先从本地存储获取
  const savedLocale = localStorage.getItem('app-locale')
  if (savedLocale && ['zh-CN', 'en-US'].includes(savedLocale)) {
    return savedLocale
  }

  // 从浏览器语言获取
  const browserLang = navigator.language
  if (browserLang.startsWith('zh')) {
    return 'zh-CN'
  }
  return 'en-US'
}

const i18n = createI18n({
  legacy: false, // 使用 Composition API 模式
  locale: getDefaultLocale(),
  fallbackLocale: 'zh-CN',
  messages: {
    'zh-CN': zhCN,
    'en-US': enUS,
  },
})

// 切换语言的辅助函数
export function setLocale(locale: 'zh-CN' | 'en-US') {
  ;(i18n.global.locale as any).value = locale
  localStorage.setItem('app-locale', locale)
  document.documentElement.setAttribute('lang', locale)
}

// 获取当前语言
export function getLocale(): string {
  return (i18n.global.locale as any).value
}

// 语言选项
export const localeOptions = [
  { label: '简体中文', value: 'zh-CN' },
  { label: 'English', value: 'en-US' },
]

export default i18n
