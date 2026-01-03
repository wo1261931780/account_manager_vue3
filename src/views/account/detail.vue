<template>
  <div class="account-detail-container">
    <!-- 顶部导航 -->
    <div class="page-header">
      <el-button :icon="ArrowLeft" @click="goBack">{{ $t('common.back') }}</el-button>
      <h2 class="page-title">{{ $t('account.detail.title') }}</h2>
    </div>

    <div v-loading="loading" class="detail-content">
      <!-- 基本信息卡片 -->
      <el-card class="info-card">
        <template #header>
          <div class="card-header">
            <span>{{ $t('account.detail.basicInfo') }}</span>
            <div class="header-actions">
              <el-button type="primary" :icon="Edit" @click="handleEdit">
                {{ $t('common.edit') }}
              </el-button>
              <el-button
                :type="accountDetail?.isFavorite ? 'warning' : 'default'"
                :icon="Star"
                @click="handleToggleFavorite"
              >
                {{ accountDetail?.isFavorite ? $t('account.removeFromFavorites') : $t('account.addToFavorites') }}
              </el-button>
            </div>
          </div>
        </template>

        <el-descriptions :column="2" border>
          <el-descriptions-item :label="$t('account.detail.platform')">
            <div class="platform-info">
              <span class="platform-name">{{ accountDetail?.platformName }}</span>
              <el-tag type="info" size="small">{{ accountDetail?.platformTypeName }}</el-tag>
            </div>
          </el-descriptions-item>

          <el-descriptions-item :label="$t('account.detail.status')">
            <el-tag :type="getStatusType(accountDetail?.accountStatus)">
              {{ accountDetail?.accountStatusText }}
            </el-tag>
          </el-descriptions-item>

          <el-descriptions-item :label="$t('account.accountName')">
            <div class="copyable-field">
              <span>{{ accountDetail?.accountName }}</span>
              <el-button link type="primary" :icon="CopyDocument" @click="copyText(accountDetail?.accountName)" />
            </div>
          </el-descriptions-item>

          <el-descriptions-item :label="$t('account.detail.importance')">
            <el-tag :type="getImportanceType(accountDetail?.importanceLevel)">
              {{ accountDetail?.importanceLevelText }}
            </el-tag>
            <el-tag v-if="accountDetail?.isMainAccount === 1" type="primary" class="ml-2">
              {{ $t('account.table.mainAccount') }}
            </el-tag>
          </el-descriptions-item>

          <el-descriptions-item :label="$t('account.form.alias')">
            {{ accountDetail?.accountAlias || '-' }}
          </el-descriptions-item>

          <el-descriptions-item :label="$t('account.form.uid')">
            <div v-if="accountDetail?.uid" class="copyable-field">
              <span>{{ accountDetail.uid }}</span>
              <el-button link type="primary" :icon="CopyDocument" @click="copyText(accountDetail.uid)" />
            </div>
            <span v-else>-</span>
          </el-descriptions-item>
        </el-descriptions>
      </el-card>

      <!-- 密码信息卡片 -->
      <el-card class="password-card">
        <template #header>
          <div class="card-header">
            <span>{{ $t('account.detail.passwordInfo') }}</span>
          </div>
        </template>

        <el-descriptions :column="2" border>
          <el-descriptions-item :label="$t('account.password')">
            <div class="password-field">
              <span class="password-text">
                {{ showPassword ? decryptedPassword : '••••••••••••' }}
              </span>
              <div class="password-actions">
                <el-tooltip :content="showPassword ? $t('account.hidePassword') : $t('account.viewPassword')">
                  <el-button
                    link
                    :type="showPassword ? 'warning' : 'primary'"
                    :icon="showPassword ? Hide : View"
                    @click="handleTogglePassword"
                  />
                </el-tooltip>
                <el-tooltip :content="$t('account.copyPassword')">
                  <el-button link type="success" :icon="CopyDocument" @click="handleCopyPassword" />
                </el-tooltip>
              </div>
            </div>
          </el-descriptions-item>

          <el-descriptions-item :label="$t('account.detail.passwordExpiry')">
            <template v-if="passwordExpiryInfo">
              <el-tag :type="passwordExpiryInfo.type">
                {{ passwordExpiryInfo.text }}
              </el-tag>
            </template>
            <span v-else>{{ $t('account.detail.neverExpire') }}</span>
          </el-descriptions-item>
        </el-descriptions>
      </el-card>

      <!-- 绑定信息卡片 -->
      <el-card class="bind-card">
        <template #header>
          <div class="card-header">
            <span>{{ $t('account.detail.bindInfo') }}</span>
          </div>
        </template>

        <el-descriptions :column="2" border>
          <el-descriptions-item :label="$t('account.form.bindPhone')">
            <div v-if="accountDetail?.bindPhone" class="copyable-field">
              <el-icon><Phone /></el-icon>
              <span>{{ accountDetail.bindPhone }}</span>
              <el-button link type="primary" :icon="CopyDocument" @click="copyText(accountDetail.bindPhone)" />
            </div>
            <span v-else>-</span>
          </el-descriptions-item>

          <el-descriptions-item :label="$t('account.form.bindEmail')">
            <div v-if="accountDetail?.bindEmail" class="copyable-field">
              <el-icon><Message /></el-icon>
              <span>{{ accountDetail.bindEmail }}</span>
              <el-button link type="primary" :icon="CopyDocument" @click="copyText(accountDetail.bindEmail)" />
            </div>
            <span v-else>-</span>
          </el-descriptions-item>

          <el-descriptions-item :label="$t('account.detail.platformUrl')" :span="2">
            <template v-if="accountDetail?.platformUrl">
              <el-link :href="accountDetail.platformUrl" target="_blank" type="primary">
                {{ accountDetail.platformUrl }}
                <el-icon class="ml-1"><Link /></el-icon>
              </el-link>
            </template>
            <span v-else>-</span>
          </el-descriptions-item>
        </el-descriptions>
      </el-card>

      <!-- 其他信息卡片 -->
      <el-card class="other-card">
        <template #header>
          <div class="card-header">
            <span>{{ $t('account.detail.otherInfo') }}</span>
          </div>
        </template>

        <el-descriptions :column="2" border>
          <el-descriptions-item :label="$t('account.detail.registerTime')">
            {{ accountDetail?.registerTime || '-' }}
          </el-descriptions-item>

          <el-descriptions-item :label="$t('account.detail.lastLoginTime')">
            {{ accountDetail?.lastLoginTime || '-' }}
          </el-descriptions-item>

          <el-descriptions-item :label="$t('common.createTime')">
            {{ accountDetail?.createTime }}
          </el-descriptions-item>

          <el-descriptions-item :label="$t('common.updateTime')">
            {{ accountDetail?.updateTime }}
          </el-descriptions-item>

          <el-descriptions-item :label="$t('account.remark')" :span="2">
            {{ accountDetail?.remark || '-' }}
          </el-descriptions-item>
        </el-descriptions>
      </el-card>

      <!-- 访问历史卡片 -->
      <el-card class="history-card">
        <template #header>
          <div class="card-header">
            <span>{{ $t('account.detail.accessHistory') }}</span>
          </div>
        </template>

        <el-table :data="accessHistory" stripe>
          <el-table-column :label="$t('account.detail.accessTime')" prop="accessTime" width="180" />
          <el-table-column :label="$t('account.detail.accessType')" prop="accessType" width="120">
            <template #default="{ row }">
              <el-tag size="small" :type="row.accessType === 'view' ? 'info' : 'success'">
                {{ row.accessType === 'view' ? $t('account.detail.viewed') : $t('account.detail.copied') }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column :label="$t('account.detail.ipAddress')" prop="ipAddress" />
        </el-table>

        <el-empty v-if="accessHistory.length === 0" :description="$t('common.noData')" />
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import {
  ArrowLeft, Edit, Star, View, Hide, CopyDocument, Phone, Message, Link
} from '@element-plus/icons-vue'
import { getAccountById, getAccountPassword } from '@/api/account'
import { addFavorite, removeFavorite, checkFavorite } from '@/api/dashboard'
import type { Account } from '@/types'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()

// 账号详情
const loading = ref(false)
const accountDetail = ref<Account & { isFavorite?: boolean } | null>(null)

// 密码相关
const showPassword = ref(false)
const decryptedPassword = ref('')

// 访问历史（模拟数据，后端可扩展）
const accessHistory = ref<Array<{
  accessTime: string
  accessType: 'view' | 'copy'
  ipAddress: string
}>>([])

type TagType = 'success' | 'warning' | 'danger' | 'info' | 'primary'

// 获取状态类型
function getStatusType(status?: number): TagType {
  const types: Record<number, TagType> = { 0: 'info', 1: 'success', 2: 'danger', 3: 'warning' }
  return types[status || 0] || 'info'
}

// 获取重要程度类型
function getImportanceType(level?: number): TagType {
  const types: Record<number, TagType> = { 1: 'info', 2: 'primary', 3: 'warning', 4: 'danger' }
  return types[level || 1] || 'primary'
}

// 密码过期信息
const passwordExpiryInfo = computed<{ type: TagType; text: string } | null>(() => {
  if (!accountDetail.value?.expireTime) return null

  const expireDate = new Date(accountDetail.value.expireTime)
  const now = new Date()
  const diffDays = Math.ceil((expireDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

  if (diffDays < 0) {
    return { type: 'danger', text: t('passwordTools.expired') }
  } else if (diffDays <= 7) {
    return { type: 'warning', text: t('account.detail.expiresIn', { days: diffDays }) }
  } else if (diffDays <= 30) {
    return { type: 'info', text: t('account.detail.expiresIn', { days: diffDays }) }
  } else {
    return { type: 'success', text: t('account.detail.expiresIn', { days: diffDays }) }
  }
})

// 返回上一页
function goBack() {
  router.push('/accounts')
}

// 加载账号详情
async function loadAccountDetail() {
  const id = Number(route.params.id)
  if (!id) {
    ElMessage.error(t('account.detail.invalidId'))
    goBack()
    return
  }

  loading.value = true
  try {
    const [accountRes, favoriteRes] = await Promise.all([
      getAccountById(id),
      checkFavorite(id)
    ])

    if (accountRes.code === 200) {
      accountDetail.value = {
        ...accountRes.data,
        isFavorite: favoriteRes.code === 200 ? favoriteRes.data : false
      }
    } else {
      ElMessage.error(accountRes.message || t('account.detail.loadFailed'))
      goBack()
    }
  } catch (error) {
    console.error('加载账号详情失败:', error)
    ElMessage.error(t('account.detail.loadFailed'))
  } finally {
    loading.value = false
  }
}

// 切换密码显示
async function handleTogglePassword() {
  if (!showPassword.value) {
    // 需要先获取密码
    try {
      const res = await getAccountPassword(accountDetail.value!.id)
      if (res.code === 200) {
        decryptedPassword.value = res.data
        showPassword.value = true

        // 记录访问历史
        addAccessHistory('view')
      }
    } catch (error) {
      console.error('获取密码失败:', error)
    }
  } else {
    showPassword.value = false
    decryptedPassword.value = ''
  }
}

// 复制密码
async function handleCopyPassword() {
  try {
    let password = decryptedPassword.value
    if (!password) {
      const res = await getAccountPassword(accountDetail.value!.id)
      if (res.code === 200) {
        password = res.data
      }
    }

    await navigator.clipboard.writeText(password)
    ElMessage.success(t('account.passwordCopied'))

    // 记录访问历史
    addAccessHistory('copy')
  } catch (error) {
    ElMessage.error(t('account.message.copyFailed'))
  }
}

// 复制文本
async function copyText(text?: string) {
  if (!text) return
  try {
    await navigator.clipboard.writeText(text)
    ElMessage.success(t('account.message.copied'))
  } catch (error) {
    ElMessage.error(t('account.message.copyFailed'))
  }
}

// 收藏切换
async function handleToggleFavorite() {
  if (!accountDetail.value) return

  try {
    if (accountDetail.value.isFavorite) {
      await removeFavorite(accountDetail.value.id)
      ElMessage.success(t('account.message.removeFavorite'))
    } else {
      await addFavorite(accountDetail.value.id)
      ElMessage.success(t('account.message.addFavorite'))
    }
    accountDetail.value.isFavorite = !accountDetail.value.isFavorite
  } catch (error) {
    console.error('操作失败:', error)
  }
}

// 编辑账号
function handleEdit() {
  router.push(`/accounts?edit=${accountDetail.value?.id}`)
}

// 添加访问历史记录（前端模拟，可扩展为后端API）
function addAccessHistory(type: 'view' | 'copy') {
  accessHistory.value.unshift({
    accessTime: new Date().toLocaleString(),
    accessType: type,
    ipAddress: '本地访问'
  })
}

onMounted(() => {
  loadAccountDetail()
})
</script>

<style lang="scss" scoped>
.account-detail-container {
  padding: 0;
}

.page-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;

  .page-title {
    margin: 0;
    font-size: 20px;
    font-weight: 600;
  }
}

.detail-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.info-card,
.password-card,
.bind-card,
.other-card,
.history-card {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    span {
      font-weight: 600;
      font-size: 16px;
    }

    .header-actions {
      display: flex;
      gap: 8px;
    }
  }
}

.platform-info {
  display: flex;
  align-items: center;
  gap: 8px;

  .platform-name {
    font-weight: 500;
  }
}

.copyable-field {
  display: flex;
  align-items: center;
  gap: 8px;

  .el-icon {
    color: #909399;
  }
}

.password-field {
  display: flex;
  align-items: center;
  gap: 12px;

  .password-text {
    font-family: monospace;
    font-size: 14px;
    letter-spacing: 1px;
  }

  .password-actions {
    display: flex;
    gap: 4px;
  }
}

.ml-1 {
  margin-left: 4px;
}

.ml-2 {
  margin-left: 8px;
}

:deep(.el-descriptions__label) {
  width: 120px;
  font-weight: 500;
}
</style>
