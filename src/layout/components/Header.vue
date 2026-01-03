<template>
  <div class="header" :class="{ 'is-mobile': appStore.isMobile }">
    <!-- 左侧 -->
    <div class="header-left">
      <!-- 折叠按钮 -->
      <div class="collapse-btn" @click="appStore.toggleSidebar">
        <el-icon :size="20">
          <template v-if="appStore.isMobile">
            <Close v-if="appStore.mobileSidebarVisible" />
            <Operation v-else />
          </template>
          <template v-else>
            <Fold v-if="!appStore.sidebarCollapsed" />
            <Expand v-else />
          </template>
        </el-icon>
      </div>

      <!-- 面包屑 - 桌面端显示 -->
      <el-breadcrumb v-if="!appStore.isMobile" separator="/">
        <el-breadcrumb-item :to="{ path: '/' }">{{ $t('menu.dashboard') }}</el-breadcrumb-item>
        <el-breadcrumb-item v-if="currentRoute.meta.title">
          {{ getMenuTitle(currentRoute.meta.title as string) }}
        </el-breadcrumb-item>
      </el-breadcrumb>

      <!-- 移动端标题 -->
      <span v-else class="mobile-title">{{ getMenuTitle(currentRoute.meta.title as string || 'Dashboard') }}</span>
    </div>

    <!-- 右侧 -->
    <div class="header-right">
      <!-- 全局搜索 - 桌面端显示 -->
      <div v-if="!appStore.isMobile" class="header-search">
        <el-input
          v-model="searchKeyword"
          :placeholder="$t('account.accountName') + '...'"
          :prefix-icon="Search"
          clearable
          style="width: 240px"
          @keyup.enter="handleSearch"
        />
      </div>

      <!-- 移动端搜索按钮 -->
      <el-tooltip v-if="appStore.isMobile" :content="$t('common.search')" placement="bottom">
        <div class="header-action" @click="mobileSearchVisible = !mobileSearchVisible">
          <el-icon :size="18"><Search /></el-icon>
        </div>
      </el-tooltip>

      <!-- 刷新 - 桌面端显示 -->
      <el-tooltip v-if="!appStore.isMobile" :content="$t('common.refresh')" placement="bottom">
        <div class="header-action" @click="handleRefresh">
          <el-icon :size="18"><Refresh /></el-icon>
        </div>
      </el-tooltip>

      <!-- 全屏 - 桌面端显示 -->
      <el-tooltip v-if="!appStore.isMobile" content="Full Screen" placement="bottom">
        <div class="header-action" @click="toggleFullscreen">
          <el-icon :size="18"><FullScreen /></el-icon>
        </div>
      </el-tooltip>

      <!-- 语言切换 -->
      <el-dropdown trigger="click" @command="handleLocaleChange">
        <div class="header-action">
          <el-icon :size="18"><svg viewBox="0 0 1024 1024"><path fill="currentColor" d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm0 820c-205.4 0-372-166.6-372-372s166.6-372 372-372 372 166.6 372 372-166.6 372-372 372z"/><path fill="currentColor" d="M623.6 316.7C593.6 290.4 554 276 512 276s-81.6 14.5-111.6 40.7C369.2 344 352 380.7 352 420v7.6c0 4.4 3.6 8 8 8h48c4.4 0 8-3.6 8-8V420c0-44.1 43.1-80 96-80s96 35.9 96 80c0 31.1-22 59.6-56.1 72.7-21.2 8.1-39.2 22.3-52.1 41.2-12.9 18.8-19.8 41.2-19.8 64.5V620c0 4.4 3.6 8 8 8h48c4.4 0 8-3.6 8-8v-22.7c0-19.7 12.4-37.5 30.9-44.8 59.4-23.3 98.1-80 98.1-143.9 0-39.3-17.2-76-48.4-103.3zM472 732a40 40 0 1080 0 40 40 0 10-80 0z"/></svg></el-icon>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item
              v-for="item in localeOptions"
              :key="item.value"
              :command="item.value"
              :class="{ 'is-active': currentLocale === item.value }"
            >
              {{ item.label }}
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>

      <!-- 暗黑模式 -->
      <el-tooltip :content="appStore.isDarkMode ? $t('settings.lightTheme') : $t('settings.darkTheme')" placement="bottom">
        <div class="header-action" @click="appStore.toggleDarkMode">
          <el-icon :size="18">
            <Moon v-if="!appStore.isDarkMode" />
            <Sunny v-else />
          </el-icon>
        </div>
      </el-tooltip>

      <!-- 用户信息 -->
      <el-dropdown trigger="click" @command="handleCommand">
        <div class="user-info">
          <el-avatar :size="32" :icon="UserFilled" />
          <span v-if="!appStore.isMobile" class="username">{{ userStore.nickname }}</span>
          <el-icon v-if="!appStore.isMobile"><ArrowDown /></el-icon>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="profile">
              <el-icon><User /></el-icon>{{ $t('user.profile') }}
            </el-dropdown-item>
            <el-dropdown-item command="password">
              <el-icon><Key /></el-icon>{{ $t('settings.changePassword') }}
            </el-dropdown-item>
            <el-dropdown-item divided command="logout">
              <el-icon><SwitchButton /></el-icon>{{ $t('user.logout') }}
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>

  <!-- 移动端搜索框 -->
  <transition name="slide-down">
    <div v-if="appStore.isMobile && mobileSearchVisible" class="mobile-search-bar">
      <el-input
        v-model="searchKeyword"
        :placeholder="$t('account.accountName') + '...'"
        :prefix-icon="Search"
        clearable
        @keyup.enter="handleMobileSearch"
      />
    </div>
  </transition>

  <!-- 修改密码对话框 -->
  <el-dialog v-model="passwordDialogVisible" :title="$t('settings.changePassword')" width="400px">
    <el-form
      ref="passwordFormRef"
      :model="passwordForm"
      :rules="passwordRules"
      label-width="100px"
    >
      <el-form-item :label="$t('settings.currentPassword')" prop="oldPassword">
        <el-input
          v-model="passwordForm.oldPassword"
          type="password"
          show-password
          :placeholder="$t('settings.currentPassword')"
        />
      </el-form-item>
      <el-form-item :label="$t('settings.newPassword')" prop="newPassword">
        <el-input
          v-model="passwordForm.newPassword"
          type="password"
          show-password
          :placeholder="$t('settings.newPassword')"
        />
      </el-form-item>
      <el-form-item :label="$t('settings.confirmPassword')" prop="confirmPassword">
        <el-input
          v-model="passwordForm.confirmPassword"
          type="password"
          show-password
          :placeholder="$t('settings.confirmPassword')"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="passwordDialogVisible = false">{{ $t('common.cancel') }}</el-button>
      <el-button type="primary" :loading="passwordLoading" @click="handleChangePassword">
        {{ $t('common.confirm') }}
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import {
  Fold, Expand, Search, Refresh, FullScreen, Close, Operation,
  Moon, Sunny, UserFilled, ArrowDown, User, Key, SwitchButton
} from '@element-plus/icons-vue'
import { useAppStore } from '@/stores/app'
import { useUserStore } from '@/stores/user'
import { changePassword } from '@/api/auth'
import { setLocale, localeOptions } from '@/locales'

const { t, locale } = useI18n()
const route = useRoute()
const router = useRouter()
const appStore = useAppStore()
const userStore = useUserStore()

const searchKeyword = ref('')
const mobileSearchVisible = ref(false)
const passwordDialogVisible = ref(false)
const passwordLoading = ref(false)
const passwordFormRef = ref<FormInstance>()

const currentRoute = computed(() => route)
const currentLocale = computed(() => locale.value)

// 菜单名称国际化映射
function getMenuTitle(key: string): string {
  const menuMap: Record<string, string> = {
    '仪表盘': 'menu.dashboard',
    '账号管理': 'menu.account',
    '平台管理': 'menu.platform',
    '平台类型': 'menu.platformType',
    '我的收藏': 'menu.favorites',
    '密码工具': 'menu.passwordTools',
    '系统设置': 'menu.settings',
    'Dashboard': 'menu.dashboard',
    'Accounts': 'menu.account',
    'Platforms': 'menu.platform',
    'Platform Types': 'menu.platformType',
    'Favorites': 'menu.favorites',
    'Password Tools': 'menu.passwordTools',
    'Settings': 'menu.settings',
  }
  return t(menuMap[key] || key)
}

const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
})

const validateConfirmPassword = (_rule: any, value: string, callback: any) => {
  if (value !== passwordForm.newPassword) {
    callback(new Error(t('settings.passwordMismatch')))
  } else {
    callback()
  }
}

const passwordRules = computed<FormRules>(() => ({
  oldPassword: [
    { required: true, message: t('settings.currentPassword'), trigger: 'blur' },
  ],
  newPassword: [
    { required: true, message: t('settings.newPassword'), trigger: 'blur' },
    { min: 6, max: 20, message: t('settings.newPassword'), trigger: 'blur' },
  ],
  confirmPassword: [
    { required: true, message: t('settings.confirmPassword'), trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' },
  ],
}))

// 搜索
function handleSearch() {
  if (searchKeyword.value.trim()) {
    router.push({
      path: '/accounts',
      query: { keyword: searchKeyword.value },
    })
  }
}

// 移动端搜索
function handleMobileSearch() {
  handleSearch()
  mobileSearchVisible.value = false
}

// 刷新
function handleRefresh() {
  location.reload()
}

// 全屏
function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen()
  } else {
    document.exitFullscreen()
  }
}

// 语言切换
function handleLocaleChange(locale: 'zh-CN' | 'en-US') {
  setLocale(locale)
  ElMessage.success(t('settings.saved'))
}

// 下拉菜单命令
function handleCommand(command: string) {
  switch (command) {
    case 'profile':
      router.push('/settings')
      break
    case 'password':
      passwordDialogVisible.value = true
      break
    case 'logout':
      handleLogout()
      break
  }
}

// 退出登录
function handleLogout() {
  ElMessageBox.confirm(t('user.logoutConfirm'), t('common.tips'), {
    confirmButtonText: t('common.confirm'),
    cancelButtonText: t('common.cancel'),
    type: 'warning',
  }).then(() => {
    userStore.logout()
  })
}

// 修改密码
async function handleChangePassword() {
  if (!passwordFormRef.value) return

  await passwordFormRef.value.validate(async (valid) => {
    if (!valid) return

    passwordLoading.value = true
    try {
      await changePassword(passwordForm.oldPassword, passwordForm.newPassword)
      ElMessage.success(t('common.success'))
      passwordDialogVisible.value = false
      userStore.logout()
    } catch (error) {
      console.error('修改密码失败:', error)
    } finally {
      passwordLoading.value = false
    }
  })
}
</script>

<style lang="scss" scoped>
.header {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;

  &.is-mobile {
    padding: 0 12px;
  }
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;

  .mobile-title {
    font-size: 16px;
    font-weight: 500;
    color: #303133;
  }
}

.collapse-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-radius: 6px;
  transition: background-color 0.2s;

  &:hover {
    background-color: #f5f7fa;
  }
}

.header-right {
  display: flex;
  align-items: center;
  gap: 8px;

  @media (max-width: 768px) {
    gap: 4px;
  }
}

.header-action {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-radius: 6px;
  transition: background-color 0.2s;

  &:hover {
    background-color: #f5f7fa;
  }
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 12px;
  cursor: pointer;
  border-radius: 6px;
  transition: background-color 0.2s;

  @media (max-width: 768px) {
    padding: 4px;
  }

  &:hover {
    background-color: #f5f7fa;
  }

  .username {
    font-size: 14px;
    color: #303133;
  }
}

.mobile-search-bar {
  position: absolute;
  top: 60px;
  left: 0;
  right: 0;
  padding: 12px;
  background: #ffffff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 100;
}

// 移动端搜索框动画
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
}

.slide-down-enter-from,
.slide-down-leave-to {
  transform: translateY(-100%);
  opacity: 0;
}
</style>
