<template>
  <div :class="{'summary-item': !inDetail}" :ref="`pk-${_uid}`">
    <div class="item-content">
      <div class="item-title" v-if="!inDetail">
        <!-- <div class="fr h">
          <view-button :params="postParams" path="salesmanPkDetail" :inCockpit="$attrs.inCockpit"></view-button>
          <dashboard-button class="m-l-20" :chartName="$options.name"></dashboard-button>
        </div> -->
        <slot name="header"></slot>
        <!-- 业绩分析 -->
        <span class="ft-pingfang">{{langs.salesmanPk}}</span>
      </div>
        <!-- 图标内容 -->
      <div class="item-chart">
        <!-- 图标 -->
        <div class="w ft-chart">
          <div class="chart-summary">
            <!-- 统计时间 -->
            {{langs.statisticsTime}}：{{params.startDate}} ~ {{params.endDate}}
            <i v-if="showDatePicker" class="el-icon-date cursor m-l-5" @click="mountPicker($event, params)"></i>
          </div>
          <!-- <chart-type-switch class="detail-fixed-switch" v-show="inDetail && visible" :chart="chartIns" :types="['histogram', 'line']" :currentType="settings.type"></chart-type-switch> -->
          <!-- <hide-button class="detail-fixed-btn" v-show="inDetail" v-model="visible"></hide-button> -->
          <div v-show="visible">
            <chart-dimension :data="chartDimension" v-model="dimension">
            </chart-dimension>
            <!-- <el-tooltip :append-to-body="false" ref="tooltip" placement="top" v-show="dimension === 2 || dimension === 3"  :content="dimension === 2 ? langs.dimensionDesc1 : langs.dimensionDesc2">
              <icon  type="icon_question" color="#6C9AE7" :style="{right: inDetail ? '100px' : 0, top: inDetail ? '30px' : '40px'}" style="position: absolute;"></icon>
            </el-tooltip> -->
            <chart ref="chart" :dataFn="dataFn" :showChart="visible" :settings="settings"></chart>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
/**
 * @author 万焕昌 <1109923832@qq.com>
 * 员工PK
*/
/* eslint-disable */
import staffApi from 'api/staffApi'
import commonApi from 'api/commonApi'
import dateRange from './dateRange'
export default {
  name: 'salesmanPkChart',
  mixins: [dateRange],
  props: {
    inDetail: {
      type: Boolean,
      default: () => false
    },
    params: {
      type: Object
    }
  },
  computed: {
    langs() {
      const t = this.$t;
      return Object.assign({}, t('base'), t('staff.performance'), t('staff.performance.chart'), t('staff.salesmanpk'))
    }
  },
  data() {
    return {
      visible: true,
      // 所有信息
      toalResult: null,
      // 维度
      dimension: 1,
      chartDimension: [{
        text: '客户',
        value: 1,
        lang: 'customer'
      }, {
        text: '邮件',
        value: 2,
        lang: 'email'
      }, {
        text: 'EDM营销',
        value: 3,
        lang: 'EDM'
      }, {
        text: '报价',
        value: 4,
        lang: 'quote'
      }, {
        text: '订单',
        value: 5,
        lang: 'order' 
      }],
      settings: {
        type: 'histogram',
        yAxisName: ['数量']
      },
      // params 克隆对象
      postParams: {}
    }
  },
  mounted() {
    this.$el.appendChild(this.$refs.tooltip.popperVM.$el)
  },
  created() {
    if (this.params.dimension) this.dimension = this.params.dimension
    // console.error(this.params)
    this.settings.yAxisName = [ this.langs.quantity ]
    Object.keys(this.params).forEach(key => {
      this.$watch(`params.${key}`, () => {
        this.toalResult && (this.toalResult.remote = true)
        this.refresh();
      })
    })
  },
  methods: {
    /**
     * 查询数据
    */
    dataFn() {
      this.postParams = {
          operatorIdArray: this.params.operatorIdArray,
          startDate: this.params.startDate,
          endDate: this.params.endDate,
          dimension: this.dimension
        }
      if (!this.toalResult || this.toalResult.remote) {
        const params = {
          operatorIdArray: this.params.operatorIdArray ? this.params.operatorIdArray.join(',') : '',
          startDate: this.params.startDate ? this.params.startDate + ' 00:00:00' : null,
          endDate: this.params.endDate ? this.params.endDate + ' 23:59:59' : null,
          dimension: this.dimension
        };
        if (this.dimension === 1 && this.params && this.params.types) {
          params.types = this.params.types.join(',')
        }
        else if (this.dimension === 5 && this.params && this.params.orderStatus) {
          params.orderStatus = this.params.orderStatus.join(',')
        }
        return staffApi.getEmployeesPk(params).then(res => {
          this.toalResult = res.data
          this.$emit('dataChange', {
            data: res.data
          })
          return this.handleDimensionChange(this.toalResult);
        })
      } else {
        return this.handleDimensionChange(this.toalResult);
      }
    },
    handleDimensionChange() {
      if (this.dimension === 5) {
        // this.settings = {
          // type: 'histogram',
          // axisSite: { right: ['订单金额（USD）', '订单金额（RMB）'] },
          this.settings.axisSite = { right: [ this.langs.orderAmountUSD, this.langs.orderAmountRMB ] }
          // yAxisName: ['数量', '金额']
          this.settings.yAxisName = [ this.langs.quantity, this.langs.amount]
          // }
      } else {
        // this.settings = {
          // type: 'histogram',
          // yAxisName: ['数量'],
          this.settings.yAxisName = [ this.langs.quantity ];
        // }
      }
      // 客户
      if (this.dimension === 1) {
        return {
          // columns: ['业务员', '新增客户数', '未联系客户数', '移交客户数'],
          columns: [ this.langs.salesman, this.langs.customerCount, this.langs.newCount, this.langs.unconnectedCount, this.langs.transferCount],
          rows: this.toalResult.map(it => {
            return {
              [this.langs.salesman]: it.operatorName,
              [this.langs.customerCount]: it.customerNumOpera,
              [this.langs.newCount]: it.customerNum,
              [this.langs.unconnectedCount]: it.uncontactNum,
              [this.langs.transferCount]: it.transferCustomerNum
            }
          })
        }
      } else if (this.dimension === 2) {
        return {
          // columns: ['业务员', '发件数', '收件数'],
          columns: [this.langs.salesman, this.langs.sentCount, this.langs.receivedCount],
          rows: this.toalResult.map(it => {
            return {
              [this.langs.salesman]: it.operatorName,
              [this.langs.sentCount]: it.sendNum,
              [this.langs.receivedCount]: it.reciveNum,
            }
          })
        }
      } else if (this.dimension === 3) {
        return {
          // columns: ['业务员', 'EDM发件数'],
          columns: [this.langs.salesman, this.langs.EDMSentCount],
          rows: this.toalResult.map(it => {
            return {
              [this.langs.salesman]: it.operatorName,
              [this.langs.EDMSentCount]: it.edmCount
            }
          })
        }
      } else if (this.dimension === 4) {
        return {
          // columns: ['业务员', '报价次数'],
          columns: [this.langs.salesman, this.langs.quoteCount],
          rows: this.toalResult.map(it => {
            return {
              [this.langs.salesman]: it.operatorName,
              [this.langs.quoteCount]: it.quoteNum
            }
          })
        }
      } else if (this.dimension === 5) {
        return {
          // columns: ['业务员', '订单数量', '订单金额（USD）', '订单金额（RMB）'],
          columns: [this.langs.salesman, this.langs.orderCount, this.langs.orderProductCount, this.langs.orderAmountUSD, this.langs.orderAmountRMB],
          rows: this.toalResult.map(it => {
            return {
              [this.langs.salesman]: it.operatorName,
              [this.langs.orderCount]: it.orderNum,
              [this.langs.orderProductCount]: it.orderProductNum,
              [this.langs.orderAmountUSD]: it.orderAmt,
              [this.langs.orderAmountRMB]: it.orderAmtCny
            }
          })
        }
      }
    },
    refresh() {
      this.$refs.chart.refresh()
    }
  },
  watch: {
    'dimension'() {
      this.refresh();
    },
    // 多语言重新加载图表
    '$i18n.locale'(val) {
      this.refresh();
    }
  }
}
</script>

<style lang="scss" scoped>
.ft-chart{
  position: relative;
}
.desc-info{
  display: inline-block;
  line-height: 24px;
  margin-left: 20px;
  border: 1px solid #C5E3F2;
  border-radius: 2px;
  background: #f3fcff;
  padding: 0 10px;
  color: #34B2FF;
}
</style>
