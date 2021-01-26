import Icon from '../icon/icon.vue'
const tagNames = {
  performanceAnalysisDetail: {
    zh: '业绩分析',
    en: 'performance analysis'
  },
  salesmanPkDetail: {
    zh: '员工PK',
    en: 'salesman Pk'
  },
  resourceDistribution: {
    zh: '资源分布',
    en: 'resource distribution'
  },
  enquiries: {
    zh: '询盘时效',
    en: 'enquiries'
  },
  targetCompletionRate: {
    zh: '目标完成率',
    en: 'target completion rate'
  },
  conversionAnalysis: {
    zh: '转化分析',
    en: 'conversion analysis'
  },
  // 客户
  customerDistribution: {
    zh: '客户分布', // 客户分布
    en: 'Distribution'
  },
  followStep: {
    zh: '跟进阶段', // 跟进阶段
    en: 'Follow step'
  },
  orderTrend: {
    zh: '订单趋势', // 订单趋势
    en: 'Order trend'
  },
  customerOrderTrend: {
    zh: '客户订单趋势', // 订单趋势
    en: 'Customer order trend'
  },
  customerSourceConversionRate: {
    zh: '来源转化率',
    en: 'Source Conversion Rate'
  },
  customerTypeChange: {
    zh: '类型变动',
    en: 'Type Change'
  },
  activeState: {
    zh: '活跃状态', // 活跃状态
    en: 'Active state'
  },
  transferPath: {
    zh: '转移路径',
    en: 'transfer path'
  },
  // 邮件
  receiveTrend: {
    zh: '收发趋势', // 收发趋势
    en: 'Receive trend'
  },
  replyStatus: {
    zh: '回复状态', // 回复状态
    en: 'Reply status'
  },
  sendTracking: {
    zh: '发件追踪', // 发件追踪
    en: 'Send track'
  },
  emailDistribution: {
    zh: '邮件分布', // 邮件分布
    en: 'Email distribution'
  },
  productSalesRanking: {
    zh: '销售排行',
    en: 'Sales Ranking'
  },
  productSalesTrend: {
    zh: '销售趋势',
    en: 'Sales Trend'
  },
  productCategoryProportion: {
    zh: '类别占比',
    en: 'Currency Proportion'
  },
  productQuoteRanking: {
    zh: '报价排行',
    en: 'Quote Ranking'
  },
  quoteDistribution: {
    zh: '报价单分布',
    en: 'Distribution'
  },
  quoteConversionTrend: {
    zh: '转化分析',
    en: 'Conversion Trend'
  },
  orderCurrencyProportion: {
    zh: '币种占比',
    en: 'Currency Proportion'
  },
  orderDistribution: {
    zh: '订单分布',
    en: 'Distribution'
  },
  clueDistribution: {
    zh: '线索分布',
    en: 'Clue Distribution'
  },
  clueProcessTimeliness: {
    zh: '线索处理时效', // 线索处理时效
    en: 'Clue Process Timeliness'
  },
  clueTransfer: {
     zh: '线索转化', // 线索转化
     en: 'Clue Transfer'
  },
  businessStatusDistribution: {
    zh: '商机状态分布',
    en: 'Business Status Distribution'
  },
  businessExpectedOrder: {
    zh: '商机预期成单', // 商机预期成单
    en: 'Business Expected Order'
  },
  businessLostReason: {
    zh: '商机丢单原因', // 商机丢单原因
    en: 'Business Lost Reason'
  },
  businessOrderPeriod: {
    zh: '商机成单周期', // 商机成单周期
    en: 'Business Order Period'
  }
}
export default {
  name: 'viewButton',
  render(h) {
    return h('div', {
      class: ['summary-icon'],
      on: {
          click: () => this.clickHandler()
        }
    }, [
      h(Icon, {
        props: {
          type: this.type,
          color: this.prototype_copy.primaryIconLight,
          size: this.size,
          className: this.className
        },
        style: {
          marginTop: '-2px'
        }
      }),
      h('span', {
        domProps: {
          innerHTML: this.langs.viewDetails
        }
      })
    ])
  },
  computed: {
    langs() {
      return this.$tt('base')
    },
    // primaryIconLight() {
    //   return this.constructor.super.prototype.primaryIconLight
    // }
  },
  props: {
    type: {
      type: String,
      default: () => 'button-view'
    },
    color: {
      type: String
    },
    size: {
      type: Number,
      default: () => 14
    },
    className: {
      type: String
    },
    path: {
      type: String
    },
    params: {
      type: Object,
      default: ()=> {}
    },
    inCockpit: {
      type: Boolean,
      default: () => false
    }
  },
  data() {
    return {
      prototype_copy: this.constructor.super.prototype
    }
  },
  methods: {
    clickHandler() {
      console.log(this.constructor.super)
      const { zh: tagName, en: tagNameEn } = tagNames[this.path];
      this.$store.dispatch('navTag/addNavTag', {
        tagId: this.path,
        name: this.path,
        init: true,
        tagName,
        tagNameEn,
        targetId: this.path,
        closable: this.inCockpit,
        params: Object.assign({}, this.params, { updateName: false })
      })
    }
  }
}
