<template>
  <div class="dashboard-container">
    <div class="page-header">
      <h2>数据分析</h2>
      <div class="time-filter">
        <el-radio-group v-model="timeRange" @change="handleTimeRangeChange">
          <el-radio-button label="day">今日</el-radio-button>
          <el-radio-button label="week">本周</el-radio-button>
          <el-radio-button label="month">本月</el-radio-button>
          <el-radio-button label="year">全年</el-radio-button>
        </el-radio-group>
      </div>
    </div>
    
    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="10" animated />
    </div>
    
    <template v-else>
      <!-- 数据概览卡片 -->
      <el-row :gutter="20" class="stat-cards">
        <el-col :xs="24" :sm="12" :md="6">
          <el-card shadow="hover" class="stat-card">
            <div class="stat-icon blue">
              <el-icon><el-icon-chat-dot-round /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.totalChats }}</div>
              <div class="stat-label">总对话数</div>
              <div class="stat-trend" :class="stats.chatsTrend >= 0 ? 'up' : 'down'">
                <el-icon v-if="stats.chatsTrend >= 0"><el-icon-top /></el-icon>
                <el-icon v-else><el-icon-bottom /></el-icon>
                <span>{{ Math.abs(stats.chatsTrend) }}%</span>
              </div>
            </div>
          </el-card>
        </el-col>
        
        <el-col :xs="24" :sm="12" :md="6">
          <el-card shadow="hover" class="stat-card">
            <div class="stat-icon green">
              <el-icon><el-icon-message /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.totalMessages }}</div>
              <div class="stat-label">总消息数</div>
              <div class="stat-trend" :class="stats.messagesTrend >= 0 ? 'up' : 'down'">
                <el-icon v-if="stats.messagesTrend >= 0"><el-icon-top /></el-icon>
                <el-icon v-else><el-icon-bottom /></el-icon>
                <span>{{ Math.abs(stats.messagesTrend) }}%</span>
              </div>
            </div>
          </el-card>
        </el-col>
        
        <el-col :xs="24" :sm="12" :md="6">
          <el-card shadow="hover" class="stat-card">
            <div class="stat-icon orange">
              <el-icon><el-icon-user /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.totalAssistants }}</div>
              <div class="stat-label">助手数量</div>
              <div class="stat-trend" :class="stats.assistantsTrend >= 0 ? 'up' : 'down'">
                <el-icon v-if="stats.assistantsTrend >= 0"><el-icon-top /></el-icon>
                <el-icon v-else><el-icon-bottom /></el-icon>
                <span>{{ Math.abs(stats.assistantsTrend) }}%</span>
              </div>
            </div>
          </el-card>
        </el-col>
        
        <el-col :xs="24" :sm="12" :md="6">
          <el-card shadow="hover" class="stat-card">
            <div class="stat-icon purple">
              <el-icon><el-icon-document /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.totalKnowledge }}</div>
              <div class="stat-label">知识库文档</div>
              <div class="stat-trend" :class="stats.knowledgeTrend >= 0 ? 'up' : 'down'">
                <el-icon v-if="stats.knowledgeTrend >= 0"><el-icon-top /></el-icon>
                <el-icon v-else><el-icon-bottom /></el-icon>
                <span>{{ Math.abs(stats.knowledgeTrend) }}%</span>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
      
      <!-- 图表区域 -->
      <el-row :gutter="20" class="chart-row">
        <el-col :xs="24" :lg="16">
          <el-card shadow="hover" class="chart-card">
            <template #header>
              <div class="chart-header">
                <h3>对话趋势</h3>
                <el-radio-group v-model="chatTrendType" size="small" @change="updateChatTrendChart">
                  <el-radio-button label="chats">对话数</el-radio-button>
                  <el-radio-button label="messages">消息数</el-radio-button>
                </el-radio-group>
              </div>
            </template>
            <div class="chart-container">
              <div id="chat-trend-chart" style="width: 100%; height: 300px;"></div>
            </div>
          </el-card>
        </el-col>
        
        <el-col :xs="24" :lg="8">
          <el-card shadow="hover" class="chart-card">
            <template #header>
              <div class="chart-header">
                <h3>助手使用分布</h3>
              </div>
            </template>
            <div class="chart-container">
              <div id="assistant-usage-chart" style="width: 100%; height: 300px;"></div>
            </div>
          </el-card>
        </el-col>
      </el-row>
      
      <el-row :gutter="20" class="chart-row">
        <el-col :xs="24" :md="12">
          <el-card shadow="hover" class="chart-card">
            <template #header>
              <div class="chart-header">
                <h3>热门问题类型</h3>
              </div>
            </template>
            <div class="chart-container">
              <div id="question-types-chart" style="width: 100%; height: 300px;"></div>
            </div>
          </el-card>
        </el-col>
        
        <el-col :xs="24" :md="12">
          <el-card shadow="hover" class="chart-card">
            <template #header>
              <div class="chart-header">
                <h3>平均响应时间</h3>
              </div>
            </template>
            <div class="chart-container">
              <div id="response-time-chart" style="width: 100%; height: 300px;"></div>
            </div>
          </el-card>
        </el-col>
      </el-row>
      
      <!-- 助手排行榜 -->
      <el-card shadow="hover" class="ranking-card">
        <template #header>
          <div class="chart-header">
            <h3>助手排行榜</h3>
            <el-radio-group v-model="rankingType" size="small" @change="updateRanking">
              <el-radio-button label="usage">使用次数</el-radio-button>
              <el-radio-button label="satisfaction">满意度</el-radio-button>
              <el-radio-button label="response_time">响应速度</el-radio-button>
            </el-radio-group>
          </div>
        </template>
        
        <el-table :data="assistantRanking" style="width: 100%">
          <el-table-column label="排名" width="80">
            <template #default="{ $index }">
              <div class="ranking-index" :class="{ 'top-three': $index < 3 }">
                {{ $index + 1 }}
              </div>
            </template>
          </el-table-column>
          
          <el-table-column label="助手" min-width="200">
            <template #default="{ row }">
              <div class="assistant-info">
                <el-avatar :size="40" :src="row.avatar" />
                <div class="assistant-meta">
                  <div class="assistant-name">{{ row.name }}</div>
                  <div class="assistant-domain">{{ row.domain }}</div>
                </div>
              </div>
            </template>
          </el-table-column>
          
          <el-table-column label="使用次数" prop="usage" width="120" sortable></el-table-column>
          <el-table-column label="满意度" width="180">
            <template #default="{ row }">
              <el-rate v-model="row.satisfaction" disabled text-color="#ff9900"></el-rate>
            </template>
          </el-table-column>
          <el-table-column label="平均响应时间" prop="response_time" width="150" sortable></el-table-column>
          <el-table-column label="趋势" width="120">
            <template #default="{ row }">
              <div class="trend-indicator" :class="row.trend >= 0 ? 'up' : 'down'">
                <el-icon v-if="row.trend >= 0"><el-icon-top /></el-icon>
                <el-icon v-else><el-icon-bottom /></el-icon>
                <span>{{ Math.abs(row.trend) }}%</span>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import * as echarts from 'echarts/core'
import { 
  BarChart, LineChart, PieChart, 
  GaugeChart 
} from 'echarts/charts'
import {
  TitleComponent, TooltipComponent,
  GridComponent, LegendComponent,
  DataZoomComponent
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import { 
  ChatDotRound as ElIconChatDotRound, 
  Message as ElIconMessage,
  User as ElIconUser,
  Document as ElIconDocument,
  Top as ElIconTop,
  Bottom as ElIconBottom
} from '@element-plus/icons-vue'

// 注册 ECharts 组件
echarts.use([
  BarChart, LineChart, PieChart, GaugeChart,
  TitleComponent, TooltipComponent, GridComponent,
  LegendComponent, DataZoomComponent, CanvasRenderer
])

const loading = ref(true)
const timeRange = ref('month')
const chatTrendType = ref('chats')
const rankingType = ref('usage')

// 图表实例
let chatTrendChart = null
let assistantUsageChart = null
let questionTypesChart = null
let responseTimeChart = null

// 模拟数据
const stats = ref({
  totalChats: 0,
  totalMessages: 0,
  totalAssistants: 0,
  totalKnowledge: 0,
  chatsTrend: 0,
  messagesTrend: 0,
  assistantsTrend: 0,
  knowledgeTrend: 0
})

const assistantRanking = ref([])

// 时间范围变化处理
const handleTimeRangeChange = () => {
  fetchDashboardData()
}

// 更新对话趋势图表
const updateChatTrendChart = () => {
  if (!chatTrendChart) return
  
  const chartData = mockChatTrendData()
  const series = chatTrendType.value === 'chats' 
    ? [{ name: '对话数', type: 'line', data: chartData.values, smooth: true }]
    : [{ name: '消息数', type: 'line', data: chartData.messageValues, smooth: true }]
  
  chatTrendChart.setOption({
    xAxis: {
      type: 'category',
      data: chartData.dates,
      axisLabel: {
        interval: timeRange.value === 'day' ? 2 : 0
      }
    },
    series: series
  })
}

// 更新排行榜
const updateRanking = () => {
  // 根据选择的排行类型排序
  if (rankingType.value === 'usage') {
    assistantRanking.value.sort((a, b) => b.usage - a.usage)
  } else if (rankingType.value === 'satisfaction') {
    assistantRanking.value.sort((a, b) => b.satisfaction - a.satisfaction)
  } else {
    // 响应时间是越小越好
    assistantRanking.value.sort((a, b) => a.response_time.localeCompare(b.response_time))
  }
}

// 初始化图表
const initCharts = () => {
  // 对话趋势图表
  chatTrendChart = echarts.init(document.getElementById('chat-trend-chart'))
  const chatTrendData = mockChatTrendData()
  
  chatTrendChart.setOption({
    title: {
      text: ''
    },
    tooltip: {
      trigger: 'axis'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: chatTrendData.dates
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '对话数',
        type: 'line',
        data: chatTrendData.values,
        smooth: true,
        itemStyle: {
          color: '#409EFF'
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(64, 158, 255, 0.7)' },
            { offset: 1, color: 'rgba(64, 158, 255, 0.1)' }
          ])
        }
      }
    ]
  })
  
  // 助手使用分布图表
  assistantUsageChart = echarts.init(document.getElementById('assistant-usage-chart'))
  const assistantUsageData = mockAssistantUsageData()
  
  assistantUsageChart.setOption({
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'horizontal',
      bottom: 0,
      data: assistantUsageData.map(item => item.name)
    },
    series: [
      {
        name: '助手使用',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: '14',
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: assistantUsageData
      }
    ]
  })
  
  // 问题类型图表
  questionTypesChart = echarts.init(document.getElementById('question-types-chart'))
  const questionTypesData = mockQuestionTypesData()
  
  questionTypesChart.setOption({
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'value'
    },
    yAxis: {
      type: 'category',
      data: questionTypesData.map(item => item.name)
    },
    series: [
      {
        name: '问题数量',
        type: 'bar',
        data: questionTypesData.map(item => item.value),
        itemStyle: {
          color: function(params) {
            const colorList = ['#67C23A', '#E6A23C', '#F56C6C', '#909399', '#409EFF']
            return colorList[params.dataIndex % colorList.length]
          }
        }
      }
    ]
  })
  
  // 响应时间图表
  responseTimeChart = echarts.init(document.getElementById('response-time-chart'))
  const responseTimeData = mockResponseTimeData()
  
  responseTimeChart.setOption({
    tooltip: {
      formatter: '{a} <br/>{b} : {c}s'
    },
    series: [
      {
        name: '响应时间',
        type: 'gauge',
        detail: { formatter: '{value}s' },
        data: [{ value: responseTimeData.avgTime, name: '平均响应时间' }],
        axisLine: {
          lineStyle: {
            width: 30,
            color: [
              [0.3, '#67C23A'],
              [0.7, '#E6A23C'],
              [1, '#F56C6C']
            ]
          }
        },
        pointer: {
          itemStyle: {
            color: 'auto'
          }
        }
      }
    ]
  })
}

// 窗口大小变化时重新调整图表大小
const handleResize = () => {
  chatTrendChart?.resize()
  assistantUsageChart?.resize()
  questionTypesChart?.resize()
  responseTimeChart?.resize()
}

// 模拟获取仪表盘数据
const fetchDashboardData = () => {
  loading.value = true
  
  // 模拟API请求延迟
  setTimeout(() => {
    // 模拟统计数据
    stats.value = {
      totalChats: 1258,
      totalMessages: 15742,
      totalAssistants: 12,
      totalKnowledge: 45,
      chatsTrend: 12.5,
      messagesTrend: 8.3,
      assistantsTrend: 25.0,
      knowledgeTrend: -5.2
    }
    
    // 模拟助手排行榜数据
    assistantRanking.value = [
      { id: 1, name: '前端开发助手', domain: '前端开发', avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png', usage: 458, satisfaction: 4.8, response_time: '1.2s', trend: 15.6 },
      { id: 2, name: '后端开发助手', domain: '后端开发', avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png', usage: 356, satisfaction: 4.6, response_time: '1.5s', trend: 8.3 },
      { id: 3, name: '产品经理助手', domain: '产品经理', avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png', usage: 287, satisfaction: 4.7, response_time: '1.3s', trend: 12.1 },
      { id: 4, name: 'UI设计助手', domain: '设计师', avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png', usage: 245, satisfaction: 4.9, response_time: '1.1s', trend: 18.5 },
      { id: 5, name: '数据分析助手', domain: '数据分析', avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png', usage: 198, satisfaction: 4.5, response_time: '1.7s', trend: -3.2 }
    ]
    
    // 初始化或更新图表
    if (!chatTrendChart) {
      initCharts()
    } else {
      updateChatTrendChart()
    }
    
    loading.value = false
  }, 1000)
}

// 模拟对话趋势数据
const mockChatTrendData = () => {
  const dates = []
  const values = []
  const messageValues = []
  
  let daysCount = 0
  let format = ''
  
  switch (timeRange.value) {
    case 'day':
      daysCount = 24
      format = 'HH:00'
      for (let i = 0; i < daysCount; i++) {
        dates.push(`${i.toString().padStart(2, '0')}:00`)
        values.push(Math.floor(Math.random() * 30))
        messageValues.push(Math.floor(Math.random() * 100))
      }
      break
    case 'week':
      daysCount = 7
      format = 'MM-DD'
      for (let i = 0; i < daysCount; i++) {
        const date = new Date()
        date.setDate(date.getDate() - (daysCount - 1 - i))
        dates.push(`${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`)
        values.push(Math.floor(Math.random() * 100))
        messageValues.push(Math.floor(Math.random() * 500))
      }
      break
    case 'month':
      daysCount = 30
      format = 'MM-DD'
      for (let i = 0; i < daysCount; i++) {
        const date = new Date()
        date.setDate(date.getDate() - (daysCount - 1 - i))
        dates.push(`${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`)
        values.push(Math.floor(Math.random() * 50))
        messageValues.push(Math.floor(Math.random() * 300))
      }
      break
    case 'year':
      daysCount = 12
      format = 'YYYY-MM'
      for (let i = 0; i < daysCount; i++) {
        const date = new Date()
        date.setMonth(date.getMonth() - (daysCount - 1 - i))
        dates.push(`${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`)
        values.push(Math.floor(Math.random() * 500))
        messageValues.push(Math.floor(Math.random() * 3000))
      }
      break
  }
  
  return { dates, values, messageValues }
}

// 模拟助手使用分布数据
const mockAssistantUsageData = () => {
  return [
    { value: 458, name: '前端开发助手' },
    { value: 356, name: '后端开发助手' },
    { value: 287, name: '产品经理助手' },
    { value: 245, name: 'UI设计助手' },
    { value: 198, name: '数据分析助手' }
  ]
}

// 模拟问题类型数据
const mockQuestionTypesData = () => {
  return [
    { value: 320, name: '功能咨询' },
    { value: 240, name: '技术问题' },
    { value: 180, name: '最佳实践' },
    { value: 150, name: '错误排查' },
    { value: 120, name: '其他' }
  ]
}

// 模拟响应时间数据
const mockResponseTimeData = () => {
  return {
    avgTime: 1.5,
    minTime: 0.8,
    maxTime: 3.2
  }
}

onMounted(() => {
  fetchDashboardData()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  chatTrendChart?.dispose()
  assistantUsageChart?.dispose()
  questionTypesChart?.dispose()
  responseTimeChart?.dispose()
})
</script>

<style scoped>
.dashboard-container {
  padding: 20px 0;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0;
  font-size: 24px;
  color: #303133;
}

.loading-container {
  padding: 40px 0;
}

.stat-cards {
  margin-bottom: 20px;
}

.stat-card {
  display: flex;
  align-items: center;
  padding: 20px;
  margin-bottom: 20px;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  margin-right: 15px;
}

.stat-icon.blue {
  background-color: rgba(64, 158, 255, 0.1);
  color: #409EFF;
}

.stat-icon.green {
  background-color: rgba(103, 194, 58, 0.1);
  color: #67C23A;
}

.stat-icon.orange {
  background-color: rgba(230, 162, 60, 0.1);
  color: #E6A23C;
}

.stat-icon.purple {
  background-color: rgba(144, 147, 153, 0.1);
  color: #909399;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #303133;
  line-height: 1;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-bottom: 5px;
}

.stat-trend {
  display: flex;
  align-items: center;
  font-size: 12px;
}

.stat-trend.up {
  color: #67C23A;
}

.stat-trend.down {
  color: #F56C6C;
}

.chart-row {
  margin-bottom: 20px;
}

.chart-card {
  margin-bottom: 20px;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chart-header h3 {
  margin: 0;
  font-size: 16px;
  color: #303133;
}

.chart-container {
  padding: 10px 0;
}

.ranking-card {
  margin-bottom: 20px;
}

.ranking-index {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: #f0f2f5;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  font-weight: bold;
  color: #606266;
}

.ranking-index.top-three {
  background-color: #409EFF;
  color: #fff;
}

.assistant-info {
  display: flex;
  align-items: center;
}

.assistant-meta {
  margin-left: 10px;
}

.assistant-name {
  font-size: 14px;
  color: #303133;
  margin-bottom: 3px;
}

.assistant-domain {
  font-size: 12px;
  color: #909399;
}

.trend-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
}

.trend-indicator.up {
  color: #67C23A;
}

.trend-indicator.down {
  color: #F56C6C;
}

@media (max-width: 768px) {
  .stat-card {
    margin-bottom: 15px;
  }
  
  .stat-value {
    font-size: 24px;
  }
  
  .chart-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .chart-container {
    height: 250px !important;
  }
}
</style> 