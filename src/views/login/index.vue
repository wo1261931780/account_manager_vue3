<template>
  <div class="login-container">
    <div class="login-bg">
      <div class="login-bg-pattern"></div>
    </div>

    <div class="login-content">
      <div class="login-card">
        <!-- 语言切换 -->
        <div class="language-switch">
          <el-dropdown trigger="click" @command="handleLocaleChange">
            <el-button circle size="small">
              <el-icon><svg viewBox="0 0 1024 1024"><path fill="currentColor" d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm0 820c-205.4 0-372-166.6-372-372s166.6-372 372-372 372 166.6 372 372-166.6 372-372 372z"/><path fill="currentColor" d="M623.6 316.7C593.6 290.4 554 276 512 276s-81.6 14.5-111.6 40.7C369.2 344 352 380.7 352 420v7.6c0 4.4 3.6 8 8 8h48c4.4 0 8-3.6 8-8V420c0-44.1 43.1-80 96-80s96 35.9 96 80c0 31.1-22 59.6-56.1 72.7-21.2 8.1-39.2 22.3-52.1 41.2-12.9 18.8-19.8 41.2-19.8 64.5V620c0 4.4 3.6 8 8 8h48c4.4 0 8-3.6 8-8v-22.7c0-19.7 12.4-37.5 30.9-44.8 59.4-23.3 98.1-80 98.1-143.9 0-39.3-17.2-76-48.4-103.3zM472 732a40 40 0 1080 0 40 40 0 10-80 0z"/></svg></el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item
                  v-for="item in localeOptions"
                  :key="item.value"
                  :command="item.value"
                >
                  {{ item.label }}
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>

        <div class="login-header">
          <div class="logo">
            <el-icon :size="48" color="#409EFF"><Key /></el-icon>
          </div>
          <h1 class="title">{{ $t('login.title') }}</h1>
          <p class="subtitle">{{ $t('login.subtitle') }}</p>
        </div>

        <el-form
          ref="loginFormRef"
          :model="loginForm"
          :rules="loginRules"
          class="login-form"
          size="large"
          @keyup.enter="handleLogin"
        >
          <el-form-item prop="username">
            <el-input
              v-model="loginForm.username"
              :placeholder="$t('login.username')"
              :prefix-icon="User"
              clearable
            />
          </el-form-item>

          <el-form-item prop="password">
            <el-input
              v-model="loginForm.password"
              type="password"
              :placeholder="$t('login.password')"
              :prefix-icon="Lock"
              show-password
              clearable
            />
          </el-form-item>

          <el-form-item>
            <div class="login-options">
              <el-checkbox v-model="rememberMe">{{ $t('login.rememberMe') }}</el-checkbox>
            </div>
          </el-form-item>

          <el-form-item>
            <el-button
              type="primary"
              class="login-btn"
              :loading="loading"
              @click="handleLogin"
            >
              <el-icon v-if="!loading"><Unlock /></el-icon>
              {{ loading ? $t('common.loading') : $t('login.loginButton') }}
            </el-button>
          </el-form-item>
        </el-form>

        <div class="login-footer">
          <p>{{ currentLocale === 'zh-CN' ? '默认账号：admin / admin123' : 'Default: admin / admin123' }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { User, Lock, Key, Unlock } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { setLocale, localeOptions } from '@/locales'

const { t, locale } = useI18n()
const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const loginFormRef = ref<FormInstance>()
const loading = ref(false)
const rememberMe = ref(false)
const currentLocale = computed(() => locale.value)

const loginForm = reactive({
  username: '',
  password: '',
})

const loginRules = computed<FormRules>(() => ({
  username: [
    { required: true, message: t('login.usernameRequired'), trigger: 'blur' },
    { min: 3, max: 20, message: t('login.usernameRequired'), trigger: 'blur' },
  ],
  password: [
    { required: true, message: t('login.passwordRequired'), trigger: 'blur' },
    { min: 6, max: 20, message: t('login.passwordRequired'), trigger: 'blur' },
  ],
}))

// 语言切换
function handleLocaleChange(locale: 'zh-CN' | 'en-US') {
  setLocale(locale)
}

// 登录
async function handleLogin() {
  if (!loginFormRef.value) return

  await loginFormRef.value.validate(async (valid) => {
    if (!valid) return

    loading.value = true
    try {
      const success = await userStore.login({
        username: loginForm.username,
        password: loginForm.password,
      })

      if (success) {
        ElMessage.success(t('login.loginSuccess'))
        // 跳转到目标页面
        const redirect = route.query.redirect as string
        router.push(redirect || '/')
      }
    } finally {
      loading.value = false
    }
  })
}

// 初始化
onMounted(() => {
  // 检查是否有记住的用户名
  const savedUsername = localStorage.getItem('rememberedUsername')
  if (savedUsername) {
    loginForm.username = savedUsername
    rememberMe.value = true
  }
})
</script>

<style lang="scss" scoped>
.login-container {
  width: 100%;
  height: 100vh;
  display: flex;
  position: relative;
  overflow: hidden;
}

.login-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

  .login-bg-pattern {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-image:
      radial-gradient(circle at 20% 80%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 40% 40%, rgba(255, 255, 255, 0.05) 0%, transparent 50%);
  }
}

.login-content {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 1;
}

.login-card {
  width: 420px;
  padding: 40px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
  position: relative;
}

.language-switch {
  position: absolute;
  top: 16px;
  right: 16px;
}

.login-header {
  text-align: center;
  margin-bottom: 40px;

  .logo {
    width: 80px;
    height: 80px;
    margin: 0 auto 20px;
    background: linear-gradient(135deg, #409EFF 0%, #67C23A 100%);
    border-radius: 20px;
    display: flex;
    align-items: center;
    justify-content: center;

    .el-icon {
      color: white !important;
    }
  }

  .title {
    font-size: 28px;
    font-weight: 600;
    color: #303133;
    margin: 0 0 8px;
  }

  .subtitle {
    font-size: 14px;
    color: #909399;
    margin: 0;
  }
}

.login-form {
  .el-input {
    :deep(.el-input__wrapper) {
      padding: 0 15px;
      height: 50px;
      border-radius: 8px;
      box-shadow: 0 0 0 1px #dcdfe6 inset;

      &:hover {
        box-shadow: 0 0 0 1px #c0c4cc inset;
      }

      &.is-focus {
        box-shadow: 0 0 0 1px #409EFF inset;
      }
    }

    :deep(.el-input__inner) {
      height: 100%;
    }
  }
}

.login-options {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.login-btn {
  width: 100%;
  height: 50px;
  font-size: 16px;
  border-radius: 8px;
  background: linear-gradient(135deg, #409EFF 0%, #67C23A 100%);
  border: none;

  &:hover {
    opacity: 0.9;
  }
}

.login-footer {
  text-align: center;
  margin-top: 20px;

  p {
    font-size: 12px;
    color: #909399;
    margin: 0;
  }
}

// 响应式
@media (max-width: 480px) {
  .login-card {
    width: 90%;
    padding: 30px 20px;
  }

  .login-header {
    .title {
      font-size: 24px;
    }
  }
}
</style>
