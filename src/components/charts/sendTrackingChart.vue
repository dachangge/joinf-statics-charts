<template>
  <div :class="{'summary-item': !inDetail}">
    <div class="item-content">
      <div class="item-title" v-if="!inDetail">
        <!-- <div class="fr h">
          <view-button :params="postParams" path="sendTracking" :inCockpit="$attrs.inCockpit"></view-button>
          <dashboard-button class="m-l-20" :chartName="$options.name"></dashboard-button>
        </div> -->
        <slot name="header"></slot>
        <!-- 邮件追踪 -->
        <span class="ft-pingfang">
          {{langs.sendTracking}}
          <!-- <span class="title-desc m-l-20">{{langs.emailTotal}}：{{totalNum}}</span> -->
        </span>
      </div>
        <!-- 图标内容 -->
      <div class="item-chart">
        <!-- 图标 -->
        <div class="w ft-chart">
          <div class="chart-summary">
            <!-- <span class="fr">{{langs.emailTotal}}：{{totalNum}}</span> -->
            <!-- 统计时间 -->
            {{langs.statisticsTime}}：{{params.startDate | timeWithoutHourSecondMinute}} ~ {{params.endDate | timeWithoutHourSecondMinute}}
            <i v-if="showDatePicker" class="el-icon-date cursor m-l-5" @click="mountPicker($event, params)"></i>
          </div>
          <!-- <el-tooltip ref="tooltip" placement="top" :content="langs.trackTips">
            <icon type="icon_question" color="#6C9AE7" :style="{right: inDetail ? '80px' : 0, top: inDetail ? '5px' : '40px'}" style="position: absolute;z-index: 99999;"></icon>
          </el-tooltip> -->
          <!-- <hide-button class="detail-fixed-btn" v-show="inDetail" v-model="visible"></hide-button> -->
          <div class="inner-chart-wrap">
            <chart :legend="legend" :tooltip="tooltip" :height="height" v-show="visible" ref="chart" :dataFn="dataFn" :showChart="visible" :settings="settings" :legendVisible="false"></chart>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
/**
* @author chenxin <542501270@qq.com>
* @time 2020年06月12日 13:51:11 星期五
* @desc 发件追踪 图表
* @vue-computed {Object} langs - 多语言翻译对象
*/
import emailApi from 'api/emailApi'
import dateRange from './dateRange'
export default {
  name: 'sendTrackingChart',
  mixins: [dateRange],
  data() {
    return {
      chartDimension: [],
      settings: {
        type: 'funnel',
        offsetY: '5%',
        left: 'left',
        label: {
          align: 'right',
          position: 'right'
         },
        calculable: true,
        useDefaultOrder: true,
      },
      legend: {
        formatter: function (name) {
          if (!name) return '';
          let idx = name.lastIndexOf('-')
          name = name.substring(0, idx).trim()
          if (name.length > 6) {
            return name.slice(0, 5) + '...';
          }
          return name
       }
      },
      tooltip: {
        formatter: function (item) {
          let tpl = []
          tpl.push(`${item.name}`)
          return tpl.join('')
       }
      },
      // 克隆对象
      postParams: {},
      totalNum: 0,
      visible: true,
    }
  },
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
      return Object.assign({}, this.$t('base'), this.$t('email'))
    }
  },
  watch: {
    // 多语言重新加载图表
    '$i18n.locale'() {
      this.refresh();
    },
  },
  created() {
    Object.keys(this.params).forEach(key => {
      this.$watch(`params.${key}`, () => {
        this.refresh();
      })
    })
  },
  methods: {
    dataFn() {
      let params = {}
      if (this.params) {
        let info = this.params
        /* eslint-disable no-restricted-syntax */
        /* eslint-disable guard-for-in */
        for (let i in info) {
          if (info[i] !== '') {
            params[i] = info[i]
          }
        }
      }
      this.postParams = params
      return emailApi.getEmailSendTracking(params).then(resp=>{
        if (resp.success) {
          let arr = []
          this.$emit('getData', {
            moduleName: 'sendTracking',
            data: resp.data,
          })
          let trackNum = resp.data[0].totalAmount
          resp.data.forEach((item, index)=>{
            if (index > 0) {
              item.proportion = trackNum > 0 ? (((item.totalAmount - 0) * 100 / trackNum).toFixed(2) + '%') : '0.00%'
            } else {
              item.proportion = '--'
            }
            arr.push({ dimension: this.$i18n.locale === 'zh' ? item.dimensionValue + ' - ' + item.totalAmount : item.dimensionValueEn + ' - ' + item.totalAmount, totalNum: item.totalAmount })
          })
          return {
            columns: ['dimension', 'totalNum'],
            rows: arr
          }
        }
      })
    },
    changeActive(info) {
      this.filterParams = Object.assign({}, info)
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
  position: absolute;
  line-height: 24px;
  margin-left: 20px;
  border: 1px solid #C5E3F2;
  border-radius: 2px;
  background: #f3fcff;
  padding: 0 10px;
  color: #34B2FF;
}
.info1 {
  margin-top: 10px;
  margin-left: 0;
}
</style>
