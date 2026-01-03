<template>
  <div class="platform-type-container">
    <!-- 操作栏 -->
    <el-card class="action-card">
      <el-button type="primary" :icon="Plus" @click="handleAdd">{{ $t('platformType.add') }}</el-button>
    </el-card>

    <!-- 数据表格 -->
    <el-card>
      <el-table v-loading="loading" :data="tableData" stripe>
        <el-table-column prop="typeCode" :label="$t('platformType.table.code')" width="150" />
        <el-table-column prop="typeName" :label="$t('platformType.table.name')" min-width="150">
          <template #default="{ row }">
            <div class="type-name">
              <el-icon v-if="row.icon"><component :is="row.icon" /></el-icon>
              <span>{{ row.typeName }}</span>
              <span v-if="row.typeNameEn" class="name-en">{{ row.typeNameEn }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="sortOrder" :label="$t('platformType.table.sort')" width="80" align="center" />
        <el-table-column :label="$t('common.status')" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'" size="small">
              {{ row.status === 1 ? $t('common.enable') : $t('common.disable') }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="remark" :label="$t('platformType.table.remark')" min-width="200" show-overflow-tooltip />
        <el-table-column :label="$t('common.actions')" width="150" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleEdit(row)">{{ $t('common.edit') }}</el-button>
            <el-button link type="danger" @click="handleDelete(row)">{{ $t('common.delete') }}</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 新增/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? $t('platformType.edit') : $t('platformType.add')"
      width="500px"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="100px"
      >
        <el-form-item :label="$t('platformType.form.code')" prop="typeCode">
          <el-input v-model="formData.typeCode" :placeholder="$t('platformType.form.codePlaceholder')" />
        </el-form-item>

        <el-form-item :label="$t('platformType.form.name')" prop="typeName">
          <el-input v-model="formData.typeName" :placeholder="$t('platformType.form.namePlaceholder')" />
        </el-form-item>

        <el-form-item :label="$t('platformType.form.nameEn')">
          <el-input v-model="formData.typeNameEn" :placeholder="$t('platformType.form.nameEnPlaceholder')" />
        </el-form-item>

        <el-form-item :label="$t('platformType.form.sort')">
          <el-input-number v-model="formData.sortOrder" :min="0" :max="999" />
        </el-form-item>

        <el-form-item :label="$t('common.status')">
          <el-switch v-model="formData.status" :active-value="1" :inactive-value="0" />
        </el-form-item>

        <el-form-item :label="$t('platformType.form.remark')">
          <el-input
            v-model="formData.remark"
            type="textarea"
            :rows="3"
            :placeholder="$t('platformType.form.remarkPlaceholder')"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">{{ $t('common.cancel') }}</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">{{ $t('common.confirm') }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import {
  getAllPlatformTypes, createPlatformType, updatePlatformType, deletePlatformType
} from '@/api/platform'
import type { PlatformType } from '@/types'

const { t } = useI18n()
const loading = ref(false)
const tableData = ref<PlatformType[]>([])

const dialogVisible = ref(false)
const isEdit = ref(false)
const submitLoading = ref(false)
const formRef = ref<FormInstance>()

const formData = reactive({
  id: undefined as number | undefined,
  typeCode: '',
  typeName: '',
  typeNameEn: '',
  sortOrder: 0,
  status: 1,
  remark: '',
})

const formRules = computed<FormRules>(() => ({
  typeCode: [{ required: true, message: t('platformType.form.codeRequired'), trigger: 'blur' }],
  typeName: [{ required: true, message: t('platformType.form.nameRequired'), trigger: 'blur' }],
}))

async function loadData() {
  loading.value = true
  try {
    const res = await getAllPlatformTypes()
    if (res.code === 200) {
      tableData.value = res.data
    }
  } catch (error) {
    console.error('加载数据失败:', error)
  } finally {
    loading.value = false
  }
}

function handleAdd() {
  isEdit.value = false
  Object.assign(formData, {
    id: undefined,
    typeCode: '',
    typeName: '',
    typeNameEn: '',
    sortOrder: 0,
    status: 1,
    remark: '',
  })
  dialogVisible.value = true
}

function handleEdit(row: PlatformType) {
  isEdit.value = true
  Object.assign(formData, {
    id: row.id,
    typeCode: row.typeCode,
    typeName: row.typeName,
    typeNameEn: row.typeNameEn,
    sortOrder: row.sortOrder,
    status: row.status,
    remark: row.remark,
  })
  dialogVisible.value = true
}

async function handleSubmit() {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (!valid) return

    submitLoading.value = true
    try {
      if (isEdit.value && formData.id) {
        await updatePlatformType(formData.id, formData)
        ElMessage.success(t('common.updateSuccess'))
      } else {
        await createPlatformType(formData)
        ElMessage.success(t('common.createSuccess'))
      }
      dialogVisible.value = false
      loadData()
    } catch (error) {
      console.error('提交失败:', error)
    } finally {
      submitLoading.value = false
    }
  })
}

async function handleDelete(row: PlatformType) {
  try {
    await ElMessageBox.confirm(
      t('platformType.message.confirmDelete', { name: row.typeName }),
      t('common.confirm'),
      { type: 'warning' }
    )
    await deletePlatformType(row.id)
    ElMessage.success(t('common.deleteSuccess'))
    loadData()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
    }
  }
}

onMounted(() => {
  loadData()
})
</script>

<style lang="scss" scoped>
.platform-type-container {
  min-height: 100%;
}

.action-card {
  margin-bottom: 16px;
}

.type-name {
  display: flex;
  align-items: center;
  gap: 8px;

  .name-en {
    font-size: 12px;
    color: #909399;
  }
}
</style>
