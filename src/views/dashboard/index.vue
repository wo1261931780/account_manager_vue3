<template>
  <div class="dashboard-container">
    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :xs="24" :sm="12" :md="6">
        <div class="stats-card stats-card-primary">
          <div class="stats-icon">
            <el-icon :size="28"><User /></el-icon>
          </div>
          <div class="stats-content">
            <div class="stats-value">{{ stats.totalAccounts }}</div>
            <div class="stats-label">{{ $t('dashboard.totalAccounts') }}</div>
          </div>
        </div>
      </el-col>

      <el-col :xs="24" :sm="12" :md="6">
        <div class="stats-card stats-card-success">
          <div class="stats-icon">
            <el-icon :size="28"><Monitor /></el-icon>
          </div>
          <div class="stats-content">
            <div class="stats-value">{{ stats.totalPlatforms }}</div>
            <div class="stats-label">{{ $t('dashboard.totalPlatforms') }}</div>
          </div>
        </div>
      </el-col>

      <el-col :xs="24" :sm="12" :md="6">
        <div class="stats-card stats-card-warning">
          <div class="stats-icon">
            <el-icon :size="28"><Warning /></el-icon>
          </div>
          <div class="stats-content">
            <div class="stats-value">{{ stats.expiringPasswords }}</div>
            <div class="stats-label">{{ $t('dashboard.expiringPasswords') }}</div>
          </div>
        </div>
      </el-col>

      <el-col :xs="24" :sm="12" :md="6">
        <div class="stats-card stats-card-info">
          <div class="stats-icon">
            <el-icon :size="28"><View /></el-icon>
          </div>
          <div class="stats-content">
            <div class="stats-value">{{ stats.recentAccessCount }}</div>
            <div class="stats-label">{{ $t('dashboard.recentAccess') }}</div>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 图表区域 - 第一行 -->
    <el-row :gutter="20" class="charts-row">
      <el-col :xs="24" :lg="12">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>{{ $t('dashboard.platformDistribution') }}</span>
            </div>
          </template>
          <div ref="pieChartRef" class="chart-container"></div>
        </el-card>
      </el-col>

      <el-col :xs="24" :lg="12">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>{{ $t('dashboard.accountStatus') }}</span>
            </div>
          </template>
          <div ref="barChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表区域 - 第二行 (新增) -->
    <el-row :gutter="20" class="charts-row">
      <el-col :xs="24" :lg="16">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>{{ $t('dashboard.accountTrend') }}</span>
            </div>
          </template>
          <div ref="lineChartRef" class="chart-container"></div>
        </el-card>
      </el-col>

      <el-col :xs="24" :lg="8">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>{{ $t('dashboard.monthlyStats') }}</span>
            </div>
          </template>
          <div ref="radarChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 快捷操作和最近访问 -->
    <el-row :gutter="20" class="action-row">
      <el-col :xs="24" :lg="8">
        <el-card class="action-card">
          <template #header>
            <div class="card-header">
              <span>{{ $t('dashboard.quickActions') }}</span>
            </div>
          </template>
          <div class="quick-actions">
            <el-button type="primary" :icon="Plus" @click="$router.push('/accounts')">
              {{ $t('dashboard.addAccount') }}
            </el-button>
            <el-button type="success" :icon="Key" @click="$router.push('/password-tools')">
              {{ $t('dashboard.generatePassword') }}
            </el-button>
            <el-button type="warning" :icon="Star" @click="$router.push('/favorites')">
              {{ $t('dashboard.myFavorites') }}
            </el-button>
            <el-button type="info" :icon="Download" @click="handleExport">
              {{ $t('dashboard.exportData') }}
            </el-button>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :lg="16">
        <el-card class="recent-card">
          <template #header>
            <div class="card-header">
              <span>{{ $t('dashboard.recentVisited') }}</span>
              <el-button type="primary" link @click="$router.push('/accounts')">
                {{ $t('dashboard.viewAll') }}
              </el-button>
            </div>
          </template>
          <el-table :data="recentAccounts" stripe style="width: 100%">
            <el-table-column prop="platformName" :label="$t('dashboard.platform')" width="150" />
            <el-table-column prop="accountName" :label="$t('dashboard.accountName')" min-width="150" />
            <el-table-column prop="lastAccessTime" :label="$t('dashboard.accessTime')" width="180">
              <template #default="{ row }">
                {{ formatTime(row.lastAccessTime) }}
              </template>
            </el-table-column>
            <el-table-column prop="accessCount" :label="$t('dashboard.accessCount')" width="100" align="center" />
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { User, Monitor, Warning, View, Plus, Key, Star, Download } from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import { getDashboardStats, getRecentAccounts } from '@/api/dashboard'
import type { RecentAccount } from '@/types'
import dayjs from 'dayjs'

const { t, locale } = useI18n()

// 统计数据
const stats = reactive({
  totalAccounts: 0,
  totalPlatforms: 0,
  expiringPasswords: 0,
  recentAccessCount: 0,
  platformTypeStats: [] as any[],
})

// 最近访问
const recentAccounts = ref<RecentAccount[]>([])

// 图表实例
const pieChartRef = ref<HTMLElement>()
const barChartRef = ref<HTMLElement>()
const lineChartRef = ref<HTMLElement>()
const radarChartRef = ref<HTMLElement>()
let pieChart: echarts.ECharts | null = null
let barChart: echarts.ECharts | null = null
let lineChart: echarts.ECharts | null = null
let radarChart: echarts.ECharts | null = null

// 格式化时间
function formatTime(time: string) {
  return dayjs(time).format('YYYY-MM-DD HH:mm')
}

// 初始化饼图
function initPieChart() {
  if (!pieChartRef.value) return

  pieChart = echarts.init(pieChartRef.value)

  const data = stats.platformTypeStats.map(item => ({
    name: item.platformTypeName,
    value: item.accountCount,
  }))

  pieChart.setOption({
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)',
    },
    legend: {
      orient: 'vertical',
      right: '5%',
      top: 'center',
    },
    series: [
      {
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['40%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2,
        },
        label: {
          show: false,
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 16,
            fontWeight: 'bold',
          },
        },
        data: data.length > 0 ? data : [{ name: t('common.noData'), value: 1 }],
      },
    ],
    color: ['#409EFF', '#67C23A', '#E6A23C', '#F56C6C', '#909399', '#00C6FF', '#7B68EE', '#FF6B6B'],
  })
}

// 初始化柱状图
function initBarChart() {
  if (!barChartRef.value) return

  barChart = echarts.init(barChartRef.value)

  barChart.setOption({
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: [t('dashboard.normal'), t('dashboard.frozen'), t('dashboard.pending'), t('dashboard.cancelled')],
    },
    yAxis: {
      type: 'value',
    },
    series: [
      {
        name: t('dashboard.totalAccounts'),
        type: 'bar',
        barWidth: '50%',
        data: [
          { value: stats.totalAccounts, itemStyle: { color: '#67C23A' } },
          { value: 0, itemStyle: { color: '#F56C6C' } },
          { value: 0, itemStyle: { color: '#E6A23C' } },
          { value: 0, itemStyle: { color: '#909399' } },
        ],
        itemStyle: {
          borderRadius: [8, 8, 0, 0],
        },
      },
    ],
  })
}

// 初始化折线图 (新增)
function initLineChart() {
  if (!lineChartRef.value) return

  lineChart = echarts.init(lineChartRef.value)

  // 生成最近6个月的数据
  const months = []
  const accountData = []
  const platformData = []

  for (let i = 5; i >= 0; i--) {
    const date = dayjs().subtract(i, 'month')
    months.push(date.format('YYYY-MM'))
    // 模拟数据，实际应该从后端获取
    accountData.push(Math.max(0, stats.totalAccounts - i * Math.floor(Math.random() * 3)))
    platformData.push(Math.max(0, stats.totalPlatforms - i * Math.floor(Math.random() * 2)))
  }

  lineChart.setOption({
    tooltip: {
      trigger: 'axis',
    },
    legend: {
      data: [t('dashboard.totalAccounts'), t('dashboard.totalPlatforms')],
      bottom: 0,
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: months,
    },
    yAxis: {
      type: 'value',
    },
    series: [
      {
        name: t('dashboard.totalAccounts'),
        type: 'line',
        smooth: true,
        areaStyle: {
          opacity: 0.3,
        },
        emphasis: {
          focus: 'series',
        },
        data: accountData,
        itemStyle: { color: '#409EFF' },
      },
      {
        name: t('dashboard.totalPlatforms'),
        type: 'line',
        smooth: true,
        areaStyle: {
          opacity: 0.3,
        },
        emphasis: {
          focus: 'series',
        },
        data: platformData,
        itemStyle: { color: '#67C23A' },
      },
    ],
  })
}

// 初始化雷达图 (新增)
function initRadarChart() {
  if (!radarChartRef.value) return

  radarChart = echarts.init(radarChartRef.value)

  radarChart.setOption({
    tooltip: {
      trigger: 'item',
    },
    radar: {
      indicator: [
        { name: t('dashboard.totalAccounts'), max: Math.max(100, stats.totalAccounts * 1.5) },
        { name: t('dashboard.totalPlatforms'), max: Math.max(50, stats.totalPlatforms * 1.5) },
        { name: t('dashboard.recentAccess'), max: Math.max(50, stats.recentAccessCount * 1.5) },
        { name: t('dashboard.myFavorites'), max: 30 },
        { name: t('dashboard.expiringPasswords'), max: Math.max(10, stats.expiringPasswords * 2) },
      ],
      radius: '60%',
    },
    series: [
      {
        name: t('dashboard.monthlyStats'),
        type: 'radar',
        data: [
          {
            value: [
              stats.totalAccounts,
              stats.totalPlatforms,
              stats.recentAccessCount,
              Math.floor(stats.totalAccounts * 0.2), // 模拟收藏数
              stats.expiringPasswords,
            ],
            name: t('dashboard.monthlyStats'),
            areaStyle: {
              color: 'rgba(64, 158, 255, 0.4)',
            },
            lineStyle: {
              color: '#409EFF',
            },
            itemStyle: {
              color: '#409EFF',
            },
          },
        ],
      },
    ],
  })
}

// 导出数据
function handleExport() {
  window.open('/api/v1/account/excel/export', '_blank')
}

// 加载数据
async function loadData() {
  try {
    // 获取统计数据
    const statsRes = await getDashboardStats()
    if (statsRes.code === 200 && statsRes.data) {
      Object.assign(stats, statsRes.data)
    }

    // 获取最近访问
    const recentRes = await getRecentAccounts(5)
    if (recentRes.code === 200 && recentRes.data) {
      recentAccounts.value = recentRes.data
    }
  } catch (error) {
    console.error('加载数据失败:', error)
  }

  // 初始化图表
  initAllCharts()
}

// 初始化所有图表
function initAllCharts() {
  initPieChart()
  initBarChart()
  initLineChart()
  initRadarChart()
}

// 销毁所有图表
function disposeAllCharts() {
  pieChart?.dispose()
  barChart?.dispose()
  lineChart?.dispose()
  radarChart?.dispose()
  pieChart = null
  barChart = null
  lineChart = null
  radarChart = null
}

// 窗口大小变化时重绘图表
function handleResize() {
  pieChart?.resize()
  barChart?.resize()
  lineChart?.resize()
  radarChart?.resize()
}

// 语言变化时重新渲染图表
watch(locale, () => {
  disposeAllCharts()
  setTimeout(initAllCharts, 100)
})

onMounted(() => {
  loadData()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  disposeAllCharts()
})
</script>

<style lang="scss" scoped>
.dashboard-container {
  min-height: 100%;
}

.stats-row {
  margin-bottom: 20px;
}

.stats-card {
  display: flex;
  align-items: center;
  padding: 24px;
  border-radius: 12px;
  color: white;
  margin-bottom: 20px;
  transition: transform 0.3s, box-shadow 0.3s;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  }

  &-primary {
    background: linear-gradient(135deg, #409EFF 0%, #79bbff 100%);
  }

  &-success {
    background: linear-gradient(135deg, #67C23A 0%, #95d475 100%);
  }

  &-warning {
    background: linear-gradient(135deg, #E6A23C 0%, #eebe77 100%);
  }

  &-info {
    background: linear-gradient(135deg, #909399 0%, #b1b3b8 100%);
  }

  .stats-icon {
    width: 60px;
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 12px;
    margin-right: 16px;
  }

  .stats-content {
    flex: 1;

    .stats-value {
      font-size: 32px;
      font-weight: 700;
      line-height: 1.2;
    }

    .stats-label {
      font-size: 14px;
      opacity: 0.9;
      margin-top: 4px;
    }
  }
}

.charts-row {
  margin-bottom: 20px;
}

.chart-card {
  margin-bottom: 20px;

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: 600;
  }
}

.chart-container {
  height: 300px;
}

.action-card {
  margin-bottom: 20px;

  .quick-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;

    .el-button {
      flex: 1;
      min-width: 120px;
    }
  }
}

.recent-card {
  margin-bottom: 20px;

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: 600;
  }
}
</style>
