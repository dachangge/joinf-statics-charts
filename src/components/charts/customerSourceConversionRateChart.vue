<template>
  <div :class="{'summary-item': !inDetail}">
  <div class="item-content">
    <!-- 图标title -->
    <div class="item-title" v-if="!inDetail">
      <!-- <div class="fr h">
        <view-button :params="postParams" path="customerSourceConversionRate" :inCockpit="$attrs.inCockpit"></view-button>
        <dashboard-button class="m-l-20" :chartName="$options.name"></dashboard-button>
      </div> -->
      <slot name="header"></slot>
      <!-- 业绩分析 -->
      <span class="ft-pingfang">
        {{langs.sourceConversionRate}}
      </span>
    </div>
    <!-- 图标内容 -->
    <div class="item-chart">
      <!-- 图标 -->
      <div class="w ft-chart">
        <div class="chart-summary">
           <span class="fr">
            <!-- 设置目标金额 -->
            <!-- <span class="link" v-if="!isFullscreen && permissions.targetAmountSetting && !$attrs.inCockpit" @click="handleTargetSetting">{{langs.setTartgetAmount}}</span> -->
            <!-- 目标金额： -->
            <!-- <span class="bf-bsar" :class="{isFullscreen: isFullscreen || !permissions.targetAmountSetting || $attrs.inCockpit}">{{langs.targetAmount}}：{{totalTargetAmount}}</span> -->
          </span>
          <!-- 统计时间 -->
          {{langs.statisticsTime}}：{{params.startDate}} ~ {{params.endDate}}
          <!-- <i v-if="showDatePicker" class="el-icon-date cursor m-l-5" @click="mountPicker($event, params)"></i> -->
        </div>
        <!-- <chart-type-switch class="detail-fixed-switch" v-show="inDetail && visible" :chart="chartIns" :types="['histogram', 'line']" :currentType="settings.type"></chart-type-switch> -->
        <!-- <hide-button class="detail-fixed-btn" v-show="inDetail" v-model="visible"></hide-button> -->
        <div v-show="visible">
            <chart ref="chart" :dataFn="dataFn" :yAxis="yAxis" :tooltip="tooltip" :showChart="visible" :legend="{show: true}" :settings="settings"></chart>
        </div>
      </div>
    </div>
  </div>
</div>
</template>
<script>
/**
 * @author 李璐 <709145101@qq.com>
 * 业绩分析图表
*/
/* eslint-disable */
import customerApi from 'api/customerApi'
import commonApi from 'api/commonApi'
import dateRange from './dateRange'
import screenfull from 'screenfull'
export default {
  name: 'customerSourceConversionRateChart',
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
      return Object.assign({}, t('base'), this.$t('chartDimension'), t('customer'))
    }
  },
  data() {
    return {
      totalNum: 0,
      chartDimension: [{
        text: '员工',
        value: 2,
        lang: 'staff'
      }, {
        text: '国家/地区',
        value: 3,
        lang: 'regions',
        permitCode: 'displayRegion'
      }, {
        text: '等级',
        value: 4,
        lang: 'grades',
        permitCode: 'grade'
      }, {
        text: '主营产品',
        value: 5,
        lang: 'mainProducts',
        permitCode: 'mainProduct'
      }],
      settings: {
        type: 'histogram',
        yAxisName: ['来源转化率'],
        itemStyle: {},
      },
      tooltip: {
        trigger: "axis",
        formatter: function(params) {
          var res = "<div><p>"  + params[0].seriesName + "</p></div>";
          for (var i = 0; i < params.length; i++) {
            if (params[i].data != undefined) {
              let val = typeof (params[i].data) === 'object' ? params[i].data[1] : params[i].data
              res += "<p>" + params[i].marker  + params[i].name + ": " + val + "%</p>";
            }
          }
          return res;
        }
      },
      yAxis: {
        axisLabel: {
          formatter: '{value}%',
        },
        axisTick: {show: false},
      },
      visible: true,
      // params 克隆对象
      postParams: {},
      // 当前是否是全屏
      isFullscreen: false,
      echartRef: null
    }
  },
  created() {
    this.settings.yAxisName = [this.langs.sourceTransRate]
    Object.keys(this.params).forEach(key => {
      this.$watch(`params.${key}`, this.refresh)
    })
    screenfull.on('change', () => {
        this.isFullscreen = screenfull.isFullscreen
    });
  },
  methods: {
    /**
     * 查询数据 getCustomerSourceTrans
    */
    dataFn() {
      let params = {}
      let that = this
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
      let columns = [that.langs.sources, that.langs.sourceTransRate]
       return customerApi.getCustomerSourceTrans(params).then(resp=>{
        let arr = []
        if (resp.success) {
          resp.data.forEach(item=>{
            let newArr = {}
            let val = item.sourceTransRate
            newArr[that.langs.sources] = that.$i18n.locale === 'zh' ? item.dimensionValue : item.dimensionValueEn
            if (val.indexOf('%') > -1) {
             val = val.slice(0,val.length-1)
            }
            newArr[that.langs.sourceTransRate] = val - 0
            if (item.dimensionValue != null) {
              arr.push(newArr)
            }
          })
          this.$emit('getData', {
            moduleName: 'customerSourceConversionRate',
            data: resp.data,
            totalNum: this.totalNum
          })
          return {
            columns: columns,
            rows: arr
          }
        }
      })
    },
    // handleTargetSetting() {
      // this.helper.modal.open(TargetAmountSetting, {
      //   parent: this
      // }).then(res => {
      //   console.log(res)
      //   this.refresh();
      // })
    // },
    // 刷新表格
    refresh() {
      this.$refs.chart.refresh()
    }
  },
  watch: {
    // 多语言重新加载图表
    '$i18n.locale'(val) {
      this.settings.yAxisName = [this.langs.hour]
      this.refresh();
    }
  }
}
</script>
