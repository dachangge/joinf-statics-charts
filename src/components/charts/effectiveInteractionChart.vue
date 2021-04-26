<template>
  <div :class="{'summary-item': !$attrs.inDetail}">
      <div class="item-content">
        <div class="item-title" v-if="!$attrs.inDetail">
          <!-- <div class="fr h">
            <view-button :params="postParams" path="effectiveInteraction" :inCockpit="$attrs.inCockpit"></view-button>
            <dashboard-button class="m-l-20" :chartName="$options.name"></dashboard-button>
          </div> -->
          <slot name="header"></slot>
          <!-- 有效互动 -->
          <span class="ft-pingfang">
            {{langs.title}}
          </span>
        </div>
        <div class="item-chart">
          <div class="w ft-chart">
            <div class="chart-summary" v-if="!$attrs.inDetail">
              <!-- 统计时间 -->
              {{langs.statisticsTime}}：{{params.startDate | timeWithoutHourSecondMinute}} ~ {{params.endDate | timeWithoutHourSecondMinute}}
              <i v-if="showDatePicker" class="el-icon-date cursor m-l-5" @click="mountPicker($event, params)"></i>
            </div>
            <chart-dimension @change="getData" :data="chartDimension" v-model="dimension" />
            <chartTable ref="chart" class="chart-table" :data="tableData" :columns="tableColumns" :postParams="postParams" />
          </div>
        </div>
      </div>
  </div>
</template>

<script>
  import chartTable from '@/components/chart-table/chartTable.vue'
  import dateRange from './dateRange'
  import customerApi from 'api/customerApi'
  import { transferPropertyArrayToString } from '@/utils/es.js'
  export default {
    name: 'effectiveInteractionChart',
    mixins: [dateRange],
    components: {
      chartTable
    },
    data() {
      const allColumns = [{
            label: { zh: '来源', en: 'Source' },
            prop: 'dimensionValue',
            linkKey: 'sources',
            dataKey: 'dimensionId',
            width: 120
          },
          {
            label: { zh: '类型', en: 'Type' },
            prop: 'customerTypeName',
            linkKey: 'types',
            dataKey: 'customerType',
            width: 76
          },
          {
            label: { zh: '客户数量', en: 'Customer number' },
            prop: 'customerTotal',
            width: 100,
            sortable: true
          },
          {
            label: { zh: '未成单时期互动率(%)', en: 'Interaction rate during unfinished single period(%)' },
            prop: 'noSignedInteractRate',
            width: 168,
            sortable: true,
            tooltip: {
              zh: '未成单时期互动率 = 客户已回复邮件 / 发送给客户的邮件总数，同封邮件被回复多次只记录一封,未成单互动率指未在系统中产生订单时期的邮件互动情况',
              en: 'Unciphered intermediate interactive rate = customer has replied to the total number of mail / sent to the customer, the same email is replied to only record a number, and the unspeakable interactive rate refers to the message interaction between the order period not generated in the system.'
            }
          },
          {
            label: { zh: '有回复的互动量', en: 'Response volume' },
            prop: 'replyEmailCustomerTotal',
            width: 136,
            sortable: true
          },
          {
            label: { zh: '有效互动率(%)', en: 'Effective interaction rate(%)' },
            prop: 'interactRate',
            width: 136,
            sortable: true,
            tooltip: {
              zh: '有效互动率 = 客户回复数 / 发送给客户的邮件总数，同封邮件被回复多次只记录一封',
              en: 'Effective interaction rate = number of customer replies/total number of emails sent to customers. Only one email is recorded when the same email is replied many times'
            }
          },
          {
            label: { zh: '已发送邮件客户数', en: 'Number of mail customers sent' },
            prop: 'sendEmailCustomerTotal',
            width: 136,
            sortable: true,
            dimension: 2
          },
          {
            label: { zh: '未发送邮件的客户数', en: 'Number of customers who did not send email' },
            prop: 'unSendEmailCustomerTotal',
            width: 136,
            sortable: true,
            dimension: 2
          }
        ]
      return {
        // 所有的列定义
        allColumns,
        // 当前查询参数的克隆对象
        postParams: {},
        // 纬度值
        dimension: 1,
        // 维度选项
        chartDimension: [{
          text: '来源',
          value: 1,
          lang: 'source'
        }, {
          text: '员工',
          value: 2,
          lang: 'staff'
        }],
        // 表格数据
        tableData: [],
        // 表格列定义
        tableColumns: [],
        observer: null
      }
    },
    props: {
      params: {
      }
    },
    computed: {
      langs() {
        return this.$tt('base', 'total.effectiveInteraction')
      }
    },
    mounted() {
      this.observerOnce()
      Object.keys(this.params).forEach(key => {
        this.$watch(`params.${key}`, this.observerOnce)
      })
    },
    watch: {
      params() {
        this.observerOnce()
      }
    },
    methods: {
      observerOnce() {
        if (this.observer) {
          this.observer.unobserve(this.$el)
          this.observer.disconnect()
        }
        this.observer = new IntersectionObserver((() => {
          let called = false;
          return (entries) => {
            if (called) return;
            if (entries[0].intersectionRatio > 0) {
              called = true;
              this.getData()
            }
          }
        })());
        this.observer.observe(this.$el)
      },
      getData() {
        let params = {
          ...this.params,
          dimension: this.dimension
        }
        if (params.dateRange && Array.isArray(params.dateRange)) {
          params.startDate = params.dateRange[0]
          params.endDate = params.dateRange[1]
        }
        this.postParams = params
        this.tableColumns = this.allColumns.filter(it => !it.dimension || this.dimension === it.dimension)
        customerApi.getCustomerInteract(transferPropertyArrayToString(params)).then(res => {
          this.tableColumns[0].label = this.dimension === 1 ? { zh: '来源', en: 'Source' } : { zh: '员工', en: 'Staff' }
          this.tableColumns[0].linkKey = this.dimension === 1 ? 'sources' : 'statisticsOperatorId'
          this.tableData = res.data.map(it => {
            return {
              ...it,
              children: it.customerInteractDtoList
            }
          })
        })
      }
    }
  }
</script>

<style lang="scss" scoped>

</style>
