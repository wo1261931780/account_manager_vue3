import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAppStore = defineStore('app', () => {
  // 侧边栏折叠状态
  const sidebarCollapsed = ref(false)

  // 暗黑模式
  const isDarkMode = ref(localStorage.getItem('darkMode') === 'true')

  // 当前激活的菜单
  const activeMenu = ref('')

  // 是否为移动端
  const isMobile = ref(false)

  // 移动端侧边栏显示状态
  const mobileSidebarVisible = ref(false)

  // 屏幕断点
  const MOBILE_BREAKPOINT = 768
  const TABLET_BREAKPOINT = 1024

  // 切换侧边栏
  function toggleSidebar() {
    if (isMobile.value) {
      mobileSidebarVisible.value = !mobileSidebarVisible.value
    } else {
      sidebarCollapsed.value = !sidebarCollapsed.value
      localStorage.setItem('sidebarCollapsed', String(sidebarCollapsed.value))
    }
  }

  // 关闭移动端侧边栏
  function closeMobileSidebar() {
    mobileSidebarVisible.value = false
  }

  // 切换暗黑模式
  function toggleDarkMode() {
    isDarkMode.value = !isDarkMode.value
    localStorage.setItem('darkMode', String(isDarkMode.value))
    updateDarkMode()
  }

  // 更新暗黑模式
  function updateDarkMode() {
    if (isDarkMode.value) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  // 设置激活菜单
  function setActiveMenu(menu: string) {
    activeMenu.value = menu
  }

  // 检测屏幕尺寸
  function checkScreenSize() {
    const width = window.innerWidth
    isMobile.value = width < MOBILE_BREAKPOINT

    // 在平板尺寸自动折叠侧边栏
    if (width < TABLET_BREAKPOINT && width >= MOBILE_BREAKPOINT) {
      sidebarCollapsed.value = true
    } else if (width >= TABLET_BREAKPOINT) {
      // 恢复用户偏好设置
      sidebarCollapsed.value = localStorage.getItem('sidebarCollapsed') === 'true'
    }

    // 移动端时关闭侧边栏
    if (isMobile.value) {
      mobileSidebarVisible.value = false
    }
  }

  // 初始化
  function init() {
    updateDarkMode()
    checkScreenSize()

    // 监听窗口大小变化
    window.addEventListener('resize', checkScreenSize)
  }

  // 清理
  function cleanup() {
    window.removeEventListener('resize', checkScreenSize)
  }

  return {
    sidebarCollapsed,
    isDarkMode,
    activeMenu,
    isMobile,
    mobileSidebarVisible,
    toggleSidebar,
    closeMobileSidebar,
    toggleDarkMode,
    setActiveMenu,
    init,
    cleanup,
  }
})
