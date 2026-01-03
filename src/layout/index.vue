<template>
  <el-container class="layout-container" :class="{ 'is-mobile': appStore.isMobile }">
    <!-- 移动端遮罩层 -->
    <div
      v-if="appStore.isMobile && appStore.mobileSidebarVisible"
      class="mobile-overlay"
      @click="appStore.closeMobileSidebar"
    />

    <!-- 侧边栏 -->
    <el-aside
      :width="sidebarWidth"
      class="layout-aside"
      :class="{
        'is-mobile': appStore.isMobile,
        'is-visible': appStore.mobileSidebarVisible
      }"
    >
      <Sidebar @menu-click="handleMenuClick" />
    </el-aside>

    <el-container class="layout-main">
      <!-- 头部 -->
      <el-header class="layout-header">
        <Header />
      </el-header>

      <!-- 主内容区 -->
      <el-main class="layout-content">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <keep-alive>
              <component :is="Component" />
            </keep-alive>
          </transition>
        </router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'
import { useAppStore } from '@/stores/app'
import Sidebar from './components/Sidebar.vue'
import Header from './components/Header.vue'

const appStore = useAppStore()

const sidebarWidth = computed(() => {
  if (appStore.isMobile) {
    return '260px'
  }
  return appStore.sidebarCollapsed ? '64px' : '220px'
})

// 移动端菜单点击后关闭侧边栏
function handleMenuClick() {
  if (appStore.isMobile) {
    appStore.closeMobileSidebar()
  }
}

onMounted(() => {
  appStore.init()
})

onUnmounted(() => {
  appStore.cleanup()
})
</script>

<style lang="scss" scoped>
.layout-container {
  width: 100%;
  height: 100vh;
  position: relative;

  &.is-mobile {
    .layout-aside {
      position: fixed;
      left: 0;
      top: 0;
      bottom: 0;
      z-index: 1001;
      transform: translateX(-100%);
      transition: transform 0.3s ease;

      &.is-visible {
        transform: translateX(0);
      }
    }
  }
}

.mobile-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  transition: opacity 0.3s ease;
}

.layout-aside {
  background: #304156;
  transition: width 0.3s ease, transform 0.3s ease;
  overflow: hidden;
}

.layout-main {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.layout-header {
  height: 60px;
  padding: 0;
  background: #ffffff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  z-index: 10;
}

.layout-content {
  flex: 1;
  padding: 20px;
  background: #f5f7fa;
  overflow-y: auto;

  @media (max-width: 768px) {
    padding: 12px;
  }
}

// 页面过渡动画
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
