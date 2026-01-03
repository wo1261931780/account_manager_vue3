<template>
  <div class="settings-container">
    <el-tabs type="border-card">
      <el-tab-pane :label="$t('settings.profile')">
        <el-card>
          <el-form :model="userForm" label-width="100px">
            <el-form-item :label="$t('settings.username')">
              <el-input v-model="userForm.username" disabled />
            </el-form-item>
            <el-form-item :label="$t('settings.nickname')">
              <el-input v-model="userForm.nickname" :placeholder="$t('settings.nicknamePlaceholder')" />
            </el-form-item>
            <el-form-item :label="$t('settings.email')">
              <el-input v-model="userForm.email" :placeholder="$t('settings.emailPlaceholder')" />
            </el-form-item>
            <el-form-item :label="$t('settings.phone')">
              <el-input v-model="userForm.phone" :placeholder="$t('settings.phonePlaceholder')" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleSaveProfile">{{ $t('common.save') }}</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-tab-pane>

      <el-tab-pane :label="$t('settings.security')">
        <el-card>
          <div class="security-item">
            <div class="item-info">
              <div class="item-title">{{ $t('settings.loginPassword') }}</div>
              <div class="item-desc">{{ $t('settings.loginPasswordDesc') }}</div>
            </div>
            <el-button type="primary" @click="passwordDialogVisible = true">{{ $t('settings.changePassword') }}</el-button>
          </div>

          <el-divider />

          <div class="security-item">
            <div class="item-info">
              <div class="item-title">{{ $t('settings.secondaryVerify') }}</div>
              <div class="item-desc">{{ $t('settings.secondaryVerifyDesc') }}</div>
            </div>
            <el-switch v-model="settings.secondaryVerify" />
          </div>

          <el-divider />

          <div class="security-item">
            <div class="item-info">
              <div class="item-title">{{ $t('settings.sessionTimeout') }}</div>
              <div class="item-desc">{{ $t('settings.sessionTimeoutDesc') }}</div>
            </div>
            <el-select v-model="settings.sessionTimeout" style="width: 150px">
              <el-option :label="$t('settings.minutes30')" :value="30" />
              <el-option :label="$t('settings.hour1')" :value="60" />
              <el-option :label="$t('settings.hours4')" :value="240" />
              <el-option :label="$t('settings.day1')" :value="1440" />
            </el-select>
          </div>
        </el-card>
      </el-tab-pane>

      <el-tab-pane :label="$t('settings.appearance')">
        <el-card>
          <div class="setting-item">
            <div class="item-info">
              <div class="item-title">{{ $t('settings.darkMode') }}</div>
              <div class="item-desc">{{ $t('settings.darkModeDesc') }}</div>
            </div>
            <el-switch v-model="appStore.isDarkMode" @change="appStore.toggleDarkMode" />
          </div>

          <el-divider />

          <div class="setting-item">
            <div class="item-info">
              <div class="item-title">{{ $t('settings.sidebarCollapse') }}</div>
              <div class="item-desc">{{ $t('settings.sidebarCollapseDesc') }}</div>
            </div>
            <el-switch v-model="appStore.sidebarCollapsed" />
          </div>

          <el-divider />

          <div class="setting-item">
            <div class="item-info">
              <div class="item-title">{{ $t('settings.pageSize') }}</div>
              <div class="item-desc">{{ $t('settings.pageSizeDesc') }}</div>
            </div>
            <el-select v-model="settings.pageSize" style="width: 150px">
              <el-option :label="$t('settings.items10')" :value="10" />
              <el-option :label="$t('settings.items20')" :value="20" />
              <el-option :label="$t('settings.items50')" :value="50" />
            </el-select>
          </div>
        </el-card>
      </el-tab-pane>

      <el-tab-pane :label="$t('settings.about')">
        <el-card>
          <div class="about-section">
            <div class="app-info">
              <div class="app-logo">
                <el-icon :size="64" color="#409EFF"><Key /></el-icon>
              </div>
              <h2>{{ $t('login.title') }}</h2>
              <p class="version">{{ $t('settings.version') }} v1.2.0</p>
              <p class="description">{{ $t('settings.appDescription') }}</p>
            </div>

            <el-divider />

            <div class="tech-stack">
              <h3>{{ $t('settings.techStack') }}</h3>
              <div class="tech-items">
                <el-tag>Vue 3</el-tag>
                <el-tag>TypeScript</el-tag>
                <el-tag>Element Plus</el-tag>
                <el-tag>Spring Boot 3</el-tag>
                <el-tag>MyBatis Plus</el-tag>
                <el-tag>MySQL</el-tag>
              </div>
            </div>
          </div>
        </el-card>
      </el-tab-pane>
    </el-tabs>

    <!-- 修改密码对话框 -->
    <el-dialog v-model="passwordDialogVisible" :title="$t('settings.changePassword')" width="400px">
      <el-form
        ref="passwordFormRef"
        :model="passwordForm"
        :rules="passwordRules"
        label-width="80px"
      >
        <el-form-item :label="$t('settings.currentPassword')" prop="oldPassword">
          <el-input v-model="passwordForm.oldPassword" type="password" show-password />
        </el-form-item>
        <el-form-item :label="$t('settings.newPassword')" prop="newPassword">
          <el-input v-model="passwordForm.newPassword" type="password" show-password />
        </el-form-item>
        <el-form-item :label="$t('settings.confirmPassword')" prop="confirmPassword">
          <el-input v-model="passwordForm.confirmPassword" type="password" show-password />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="passwordDialogVisible = false">{{ $t('common.cancel') }}</el-button>
        <el-button type="primary" @click="handleChangePassword">{{ $t('common.confirm') }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { Key } from '@element-plus/icons-vue'
import { useAppStore } from '@/stores/app'
import { useUserStore } from '@/stores/user'
import { changePassword } from '@/api/auth'

const { t } = useI18n()
const appStore = useAppStore()
const userStore = useUserStore()

const userForm = reactive({
  username: '',
  nickname: '',
  email: '',
  phone: '',
})

const settings = reactive({
  secondaryVerify: true,
  sessionTimeout: 60,
  pageSize: 10,
})

const passwordDialogVisible = ref(false)
const passwordFormRef = ref<FormInstance>()
const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
})

const validateConfirmPassword = (rule: any, value: string, callback: any) => {
  if (value !== passwordForm.newPassword) {
    callback(new Error(t('settings.passwordMismatch')))
  } else {
    callback()
  }
}

const passwordRules = computed<FormRules>(() => ({
  oldPassword: [{ required: true, message: t('settings.oldPasswordRequired'), trigger: 'blur' }],
  newPassword: [
    { required: true, message: t('settings.newPasswordRequired'), trigger: 'blur' },
    { min: 6, max: 20, message: t('settings.passwordLengthHint'), trigger: 'blur' },
  ],
  confirmPassword: [
    { required: true, message: t('settings.confirmPasswordRequired'), trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' },
  ],
}))

function handleSaveProfile() {
  ElMessage.success(t('settings.saved'))
}

async function handleChangePassword() {
  if (!passwordFormRef.value) return

  await passwordFormRef.value.validate(async (valid) => {
    if (!valid) return

    try {
      await changePassword(passwordForm.oldPassword, passwordForm.newPassword)
      ElMessage.success(t('settings.passwordChanged'))
      passwordDialogVisible.value = false
      userStore.logout()
    } catch (error) {
      console.error('修改密码失败:', error)
    }
  })
}

onMounted(() => {
  if (userStore.userInfo) {
    userForm.username = userStore.userInfo.username
    userForm.nickname = userStore.userInfo.nickname || ''
    userForm.email = userStore.userInfo.email || ''
    userForm.phone = userStore.userInfo.phone || ''
  }
})
</script>

<style lang="scss" scoped>
.settings-container {
  min-height: 100%;
}

.security-item,
.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;

  .item-info {
    .item-title {
      font-weight: 500;
      color: #303133;
    }

    .item-desc {
      font-size: 12px;
      color: #909399;
      margin-top: 4px;
    }
  }
}

.about-section {
  .app-info {
    text-align: center;
    padding: 20px;

    .app-logo {
      margin-bottom: 16px;
    }

    h2 {
      margin: 0 0 8px;
      color: #303133;
    }

    .version {
      color: #909399;
      margin: 0 0 8px;
    }

    .description {
      color: #606266;
      margin: 0;
    }
  }

  .tech-stack {
    h3 {
      margin: 0 0 16px;
      color: #303133;
    }

    .tech-items {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
  }
}
</style>
