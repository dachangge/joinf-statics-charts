/* 客户模块 */
// 客户分布
import customerDistributionChart from './customerDistributionChart'
// 跟进阶段
import flowStepChart from './customerFlowStepChart'
// 订单趋势
import customerOrderTrendChart from './customerOrderTrendChart'
// 活跃状态
import activeStateChart from './customerActiveStateChart'
// 来源转化率
import customerSourceConversionRateChart from './customerSourceConversionRateChart'
// 类型变动
import customerTypeChangeChart from './customerTypeChangeChart'
// 转移路径
import customerTransferPathChart from './customerTransferPathChart'
/* 邮件模块 */
// 收发趋势
import receiveTrendChart from './receiveTrendChart'
// 回复状态
import replyStatusChart from './replyStatusChart'
// 发件追踪
import sendTrackingChart from './sendTrackingChart'
// 邮件分布
import emailDistributionChart from './emailDistributionChart'
/* 订单 */

/* 产品 */
// 销售排行
import productSalesRankingChart from './productSalesRankingChart'
// 销售趋势
import productSalesTrendChart from './productSalesTrendChart'
// 类别占比
import productCategoryProportionChart from './productCategoryProportionChart'
// 报价排行
import productQuoteRankingChart from './productQuoteRankingChart'

/* 报价 */
import quoteDistributionChart from './quoteDistributionChart'
import quoteConversionTrendChart from './quoteConversionTrendChart'

/* 订单 */
// 订单趋势
import orderTrendChart from './orderTrendChart'
// 订单币种占比
import orderCurrencyProportionChart from './orderCurrencyProportionChart'
// 订单分布
import orderDistributionChart from './orderDistributionChart'

/* 员工管理 */
// 业绩趋势
import performanceAnalysis from './performanceAnalysis'
// 员工pk
import salesmanPkChart from './salesmanPkChart'
// 资源分布
import staffResourceDistributionChart from './staffResourceDistributionChart'
// 询盘时效
import staffEnquiriesChat from './staffEnquiriesChat'
// 目标完成率
import staffTargetCompletionRateChart from './staffTargetCompletionRateChart'
// 转化分析
import staffConversionAnalysisChart from './staffConversionAnalysisChart'

/* 商机 */
// 线索分布
import clueDistributionChart from '@/components/charts/clueDistributionChart.vue'
// 线索时效处理
import clueProcessTimelinessChart from '@/components/charts/clueProcessTimelinessChart.vue'
// 线索转化
import clueTransferChart from '@/components/charts/clueTransferChart.vue'
// 商机状态分布
import businessStatusDistributionChart from '@/components/charts/businessStatusDistributionChart.vue'
// 商机预期成单
import businessExpectedOrderChart from '@/components/charts/businessExpectedOrderChart.vue'
// 商机丢单原因
import businessLostReasonChart from '@/components/charts/businessLostReasonChart.vue'

const customer = [
  {
    component: customerDistributionChart,
    name: customerDistributionChart.name,
    // path: 'customerDistribution',
    zh: '客户分布',
    en: 'customer distribution',
    type: 'ring'
  },
  {
    component: flowStepChart,
    name: flowStepChart.name,
    // path: 'followStep',
    zh: '跟进阶段',
    en: 'flow step',
    type: 'funnel'
  },
  {
    component: customerOrderTrendChart,
    name: customerOrderTrendChart.name,
    // path: 'orderTrend',
    zh: '客户订单趋势',
    en: 'customer order trend',
    type: 'line'
  },
  {
    component: activeStateChart,
    name: activeStateChart.name,
    // path: 'activeState',
    zh: '活跃状态',
    en: 'active state',
    type: 'bar'
  },
  {
    component: customerSourceConversionRateChart,
    name: customerSourceConversionRateChart.name,
    zh: '来源转化率',
    en: 'source conversion rate',
    type: 'bar'
  },
  {
    component: customerTypeChangeChart,
    name: customerTypeChangeChart.name,
    // path: 'activeState',
    zh: '类型变动',
    en: 'type change',
    type: 'graph'
  },
  {
    component: customerTransferPathChart,
    name: customerTransferPathChart.name,
    zh: '转移路径',
    en: 'transfer path',
    type: 'graph'
  }
]

const staff = [
  {
    component: performanceAnalysis,
    name: performanceAnalysis.name,
    // path: 'performanceAnalysisDetail',
    zh: '业绩分析',
    en: 'performance analysis',
    type: 'bar'
  },
  {
    component: salesmanPkChart,
    name: salesmanPkChart.name,
    // path: 'salesmanPkDetail',
    zh: '员工PK',
    en: 'salesman Pk',
    type: 'bar'
  },
  {
    component: staffResourceDistributionChart,
    name: staffResourceDistributionChart.name,
    zh: '资源分布',
    en: 'resource distribution',
    type: 'bar'
  },
  {
    component: staffEnquiriesChat,
    name: staffEnquiriesChat.name,
    zh: '询盘时效',
    en: 'enquiries',
    type: 'bar'
  },
  {
    component: staffTargetCompletionRateChart,
    name: staffTargetCompletionRateChart.name,
    zh: '目标完成率',
    en: 'target completion rate',
    type: 'bar',
  },
  {
    component: staffConversionAnalysisChart,
    name: staffConversionAnalysisChart.name,
    zh: '转化分析',
    en: 'conversion analysis',
    type: 'bar'
  }
]

const mail = [
  {
    component: receiveTrendChart,
    name: receiveTrendChart.name,
    // path: 'receiveTrend',
    zh: '收发趋势',
    en: 'receive trend',
    type: 'line'
  },
  {
    component: replyStatusChart,
    name: replyStatusChart.name,
    // path: 'replyStatus',
    zh: '回复状态',
    en: 'reply status',
    type: 'bar'
  },
  {
    component: sendTrackingChart,
    name: sendTrackingChart.name,
    // path: 'replyStatus',
    zh: '发件追踪',
    en: 'send tracking',
    type: 'bar'
  },
  {
    component: emailDistributionChart,
    name: emailDistributionChart.name,
    // path: 'replyStatus',
    zh: '邮件分布',
    en: 'email distribution',
    type: 'funnel'
  }
]

const product = [
  {
    component: productSalesRankingChart,
    name: productSalesRankingChart.name,
    // path: '',
    zh: '销售排行',
    en: 'sales ranking',
    type: 'line'
  },
  {
    component: productSalesTrendChart,
    name: productSalesTrendChart.name,
    // path: '',
    zh: '销售趋势',
    en: 'sales trend',
    type: 'line'
  },
  {
    component: productCategoryProportionChart,
    name: productCategoryProportionChart.name,
    // path: '',
    zh: '类别占比',
    en: 'category proportion',
    type: 'rings'
  },
  {
    component: productQuoteRankingChart,
    name: productQuoteRankingChart.name,
    // path: '',
    zh: '报价排行',
    en: 'quote ranking',
    type: 'line'
  },
]
const quote = [
  {
    component: quoteDistributionChart,
    name: quoteDistributionChart.name,
    // path: '',
    zh: '报价分布',
    en: 'quote distribution',
    type: 'bar'
  },
  {
    component: quoteConversionTrendChart,
    name: quoteConversionTrendChart.name,
    // path: '',
    zh: '转化分析',
    en: 'quote conversion trend',
    type: 'line'
  }
]

const order = [
  {
    component: orderTrendChart,
    name: orderTrendChart.name,
    // path: '',
    zh: '订单趋势',
    en: 'order trend',
    type: 'line'
  },
  {
    component: orderCurrencyProportionChart,
    name: orderCurrencyProportionChart.name,
    // path: '',
    zh: '币种占比',
    en: 'quote conversion trend',
    type: 'ring'
  },
  {
    component: orderDistributionChart,
    name: orderDistributionChart.name,
    // path: '订单分布',
    zh: '订单分布',
    en: 'order distribution',
    type: 'bar'
  }
]

const business = [
  {
    component: clueDistributionChart,
    name: clueDistributionChart.name,
    // path: '',
    zh: '线索分布',
    en: 'clue distribution',
    type: 'ring'
  },
  {
    component: clueProcessTimelinessChart,
    name: clueProcessTimelinessChart.name,
    // path: '',
    zh: '线索时效处理',
    en: 'clue process timeliness',
    type: 'bar'
  },
  {
    component: clueTransferChart,
    name: clueTransferChart.name,
    // path: '',
    zh: '线索转化',
    en: 'clue transfer',
    type: 'bar'
  },
  {
    component: businessStatusDistributionChart,
    name: businessStatusDistributionChart.name,
    // path: '',
    zh: '商机状态分布',
    en: 'business status distribution',
    type: 'ring'
  },
  {
    component: businessExpectedOrderChart,
    name: businessExpectedOrderChart.name,
    // path: '',
    zh: '商机预期成单',
    en: 'business expected order',
    type: 'bar'
  },
  {
    component: businessLostReasonChart,
    name: businessLostReasonChart.name,
    // path: '',
    zh: '商机丢单原因',
    en: 'business lost reason',
    type: 'ring'
  }
]

// export default { activeStateChart, customerDistributionChart }
export default {
  customer, mail, staff, product, order, quote, business
}