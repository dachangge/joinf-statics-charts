<template>
  <div :class="{'summary-item': !inDetail}">
    <div class="item-content">
      <div class="item-title" v-if="!inDetail">
        <!-- <div class="fr h">
          <view-button :params="postParams" path="customerDistribution" :inCockpit="$attrs.inCockpit"></view-button>
          <dashboard-button class="m-l-20" :chartName="$options.name"></dashboard-button>
        </div> -->
        <slot name="header"></slot>
        <!-- 业绩分析 -->
        <span class="ft-pingfang">
          {{langs.customerDistribution}}
          <!-- <span class="title-desc m-l-20">{{langs.customerTotal}}：{{totalNum}}</span> -->
        </span>
      </div>
        <!-- 图标内容 -->
      <div class="item-chart">
        <!-- 图标 -->
        <div class="w ft-chart">
          <div class="chart-summary" v-if="showTotalWrap">
            <!-- 统计时间 -->
            <span class="fr">{{langs.customerTotal}}：{{totalNum}}</span>
            {{langs.statisticsTime}}：{{params.startDate | timeWithoutHourSecondMinute}} ~ {{params.endDate | timeWithoutHourSecondMinute}}
            <i v-if="showDatePicker" class="el-icon-date cursor m-l-5" @click="mountPicker($event, params)"></i>
          </div>
          <!-- <chart-type-switch :style="{right: dimension === 7 ? '290px' : '90px'}" class="detail-fixed-switch" v-show="inDetail && visible" :chart="chartIns" :types="['histogram', 'line', 'ring']" :currentType="settings.type"></chart-type-switch> -->
          <chart-dimension v-if="visible" :data="chartDimension" v-model="dimension">
          </chart-dimension>
            <!-- <el-tooltip :append-to-body="false" ref="tooltip" placement="top" v-show="dimension === 7 && !inDetail" :content="langs.interCourseTips">
              <icon type="icon_question" color="#6C9AE7" :style="{right: inDetail ? '280px' : 0, top: inDetail ? '5px' : '40px'}" style="position: absolute;"></icon>
            </el-tooltip> -->
          <!-- <hide-button class="detail-fixed-btn" v-show="inDetail" v-model="visible"></hide-button> -->
          <chart :legend="legend" v-show="visible" ref="chart" :dataFn="dataFn" :showChart="visible" :settings="settings"></chart>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
/**
* @author chenxin <542501270@qq.com>
* @time 2020年06月05日 14:51:11 星期五
* @desc 客户分布 图表
* @vue-computed {Object} langs - 多语言翻译对象
*/

import customerApi from 'api/customerApi'
import dateRange from './dateRange'
import { arrayTopNum } from '@/utils/es.js'
export default {
  name: 'customerDistributionChart',
  mixins: [dateRange],
  data() {
    return {
      legend: {
        formatter: function (name) {
          if (!name) return '';
          if (name.length > 20) {
            return name.slice(0, 15) + '...';
          }
          return name
       }
      },
      // tooltip: {
      //   formatter: function (item) {
      //     let tpl = []
      //     tpl.push(`${item.seriesType === 'bar' ? item.value : item.name + '：' + item.value}`)
      //     return tpl.join('')
      //  }
      // },
      chartDimension: [{
        text: '国家/地区',
        value: 2,
        lang: 'regions',
        permitCode: 'displayRegion'
      }, {
        text: '类型',
        value: 3,
        lang: 'types',
        permitCode: 'displayType',
      }, {
        text: '来源',
        value: 4,
        lang: 'sources',
        permitCode: 'source'
      }, {
        text: '等级',
        value: 5,
        lang: 'grades',
        permitCode: 'grade'
      }, {
        text: '主营产品',
        value: 6,
        lang: 'mainProducts',
        permitCode: 'mainProduct'
      }, {
        text: '往来邮件',
        value: 7,
        lang: 'intercourseMail'
      }, {
        text: '客户标签数量',
        value: 9,
        lang: 'customerTagsNumber'
      }, {
        text: '客户标签',
        value: 10,
        lang: 'customerTags'
      }],
      settings: {
        type: 'ring',
        radius: [60, 130],
        offsetY: '45%',
        notBarAxis: true,
      },
      dimension: 2, // 维度 id
      filterParams: {},
      totalNum: 0,
      // 克隆对象
      postParams: {},
      visible: true
    }
  },
  props: {
    inDetail: {
      type: Boolean,
      default: () => false
    },
    params: {
      type: Object
    },
    showTotalWrap: {
      type: Boolean
    }
  },
  computed: {
    langs() {
      return Object.assign({}, this.$t('base'), this.$t('customer'), this.$t('chartDimension'))
    }
  },
  watch: {
    'dimension'() {
      this.changeActive({ type: 'dimension', value: this.dimension });
      this.refreshSetting()
      // if (val === 7) {
        // this.settings.type = 'histogram'
        // this.settings.yAxisName = [this.langs.potentialCustomers, '']
        // this.settings.xAxisName = this.langs.DaysSinceNow
        // this.settings.labelMap = {
        //     totalNum: this.langs.potentialCustomers,
        // }
      // } else {
        // this.settings.type = 'ring'
        // this.settings.xAxisName = ''
        // this.settings.yAxisName = ''
      // }
    },
    // 多语言重新加载图表
    '$i18n.locale'() {
      this.refresh();
      this.refreshSetting()
      // if (this.dimension === 7) {
        // this.settings.type = 'histogram'
      // } else {
      //   this.settings.type = 'ring'
      //   this.settings.xAxisName = ''
      //   this.settings.yAxisName = ''
      // }
    },
    'visible'() {
      this.$emit('getData', {
        chartVisible: this.visible
      })
    }
  },
  mounted() {
    // this.$el.appendChild(this.$refs.tooltip.popperVM.$el)
  },
  created() {
    Object.keys(this.params).forEach(key => {
      this.$watch(`params.${key}`, () => {
        this.refresh();
      })
    })
    this.refreshSetting()
    console.log(this.$i18n, '$i18n')
  },
  methods: {
    /**
     * 刷新配置数据
    */
    refreshSetting() {
      const langs = ['staff', 'regions', 'types', 'sources', 'grades', 'mainProducts', 'DaysSinceNow', 'customerTags', 'customerTagsNumber']
      this.settings.yAxisName = [this.langs.customersNums, '']
      this.settings.labelMap = {
          totalNum: this.langs.customersNums,
      }
      this.settings.xAxisName = this.langs[langs[this.dimension - 1]]
      if (this.dimension === 9) {
        this.settings.xAxisName = this.langs[langs[8]]
      }
      if (this.dimension === 10) {
        this.settings.xAxisName = this.langs[langs[7]]
      }
      if (this.dimension === 7) {
        this.settings.yAxisName = [this.langs.potentialCustomers, '']
        this.settings.labelMap = {
            totalNum: this.langs.potentialCustomers,
        }
      }
    },
    /**
     * 查询展示 数据
     */
    dataFn() {
      let params = {
        dimension: this.dimension
      }
      if (this.params && this.params.type !== 'dimension') {
        let info = this.params
        /* eslint-disable no-restricted-syntax */
        /* eslint-disable guard-for-in */
        if (info.pubOrPri === '5' || info.pubOrPri === '4') {
          info.priShare = info.pubOrPri === '4' ? 1 : 0
          info.pubOrPri = 1
        }
        for (let i in info) {
          if (info[i] !== '') {
            params[i] = info[i]
          }
        }
      }
      this.postParams = { ...params }
      let columns = ['dimension', 'totalNum']
      if (params.dimension !== 7 && params.emailType) delete params.emailType
       if (params.dimension === 7 && typeof this.params.customizeEmailNum === 'undefined') {
          params.customizeEmailNum = 7
        }
      return customerApi.getCustomerDistributed(params).then(resp=>{
        if (resp.success) {
          let data = arrayTopNum(resp.data, 14)
          let arr = []
          this.totalNum = 0
          data.forEach((item, index)=>{
            this.totalNum += item.totalNum
            item.index = index
            item.dimensionValue = item.dimensionValue || this.langs.unknown
            if (this.dimension === 7) {
              // eslint-disable-next-line no-nested-ternary
              arr.push({ dimension: (this.$i18n.locale === 'zh' ? item.dimensionValue : (item.dimensionValueEn ? item.dimensionValueEn : item.dimensionValue)), totalNum: item.totalNum })
            } else {
              // eslint-disable-next-line no-nested-ternary
              arr.push({ dimension: (this.$i18n.locale === 'zh' ? item.dimensionValue : (item.dimensionValueEn ? item.dimensionValueEn : item.dimensionValue)), totalNum: item.totalNum })
            }
            if (index === 14) {
              item.children = resp.data.splice(14).map((list, index1)=>{
                return {
                  ...list,
                  index: index + index1 + 1,
                  dimensionValue: list.dimensionValue
                }
              })
            }
          })
          this.$emit('getData', {
            data: data,
            totalNum: this.totalNum,
            dimension: this.dimension,
            dimensionName: this.langs[this.chartDimension.filter(item=> { return item.value === this.dimension })[0].lang]
          })
          return {
            columns: columns,
            rows: arr
          }
        }
      })
    },
    /**
     * 查询条件变化
     */
    changeActive(info) {
      if (info.type === 'dimension') {
        this.dimension = info.value
      }
      if (this.$refs.chart) {
        this.$refs.chart.changeHandler(info)
      }
    },
    // 刷新表格
    refresh() {
      this.$refs.chart.refresh()
    }
  }
}
</script>

<style lang="scss" scoped>
.ft-chart {
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
