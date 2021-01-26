<template>
  <div :class="{'summary-item': !inDetail}">
  <div class="item-content">
    <!-- 图标title -->
    <div class="item-title" v-if="!inDetail">
      <!-- <div class="fr h">
        <view-button :params="postParams" path="enquiries" :inCockpit="$attrs.inCockpit"></view-button>
        <dashboard-button class="m-l-20" :chartName="$options.name"></dashboard-button>
      </div> -->
      <slot name="header"></slot>
      <!-- 业绩分析 -->
      <span class="ft-pingfang">
        {{langs.enquiries}}
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
          </span>
          <!-- 统计时间 -->
          {{langs.statisticsTime}}：{{params.startDate}} ~ {{params.endDate}}
          <i v-if="showDatePicker" class="el-icon-date cursor m-l-5" @click="mountPicker($event, params)"></i>
        </div>
        <!-- <chart-type-switch class="detail-fixed-switch" v-show="inDetail && visible" :chart="chartIns" :types="['histogram', 'line']" :currentType="settings.type"></chart-type-switch> -->
        <!-- <hide-button class="detail-fixed-btn" v-show="inDetail" v-model="visible"></hide-button> -->
        <!-- <chart-bottom-dimension :data="bottomDimensionList" v-model="bottomDimension"></chart-bottom-dimension> -->
        <div v-show="visible" class="inner-chart-wrap">
            <!-- <chart-dimension :data="chartDimension" v-model="dimension"></chart-dimension> -->
            <chart ref="chart" :dataFn="dataFn" :showChart="visible" :legend="{show: false}" :settings="settings"></chart>
        </div>
      </div>
    </div>
  </div>
</div>
</template>
<script>
/**
 * @author 万焕昌 <1109923832@qq.com>
 * 业绩分析图表
*/
/* eslint-disable */
import staffApi from 'api/staffApi'
import commonApi from 'api/commonApi'
import dateRange from './dateRange'
import screenfull from 'screenfull'
export default {
  name: 'staffEnquiriesChart',
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
      return Object.assign({}, t('base'), t('staff.enquiries'))
    }
  },
  data() {
    return {
      // 维度
      // dimension: 2,
      // department2: false,
      // chartDimension: [{
      //   text: '员工',
      //   value: 2,
      //   lang: 'staff'
      // }, {
      //   text: '国家/地区',
      //   value: 3,
      //   lang: 'regions'
      // }, {
      //   text: '等级',
      //   value: 4,
      //   lang: 'grades'
      // }, {
      //   text: '主营产品',
      //   value: 5,
      //   lang: 'mainProducts'
      // }],
      settings: {
        type: 'histogram',
        yAxisName: ['小时'],
      },
      visible: true,
      // params 克隆对象
      postParams: {},
      // 当前是否是全屏
      isFullscreen: false,
      echartRef: null
    }
  },
  mounted() {
    this.dataFn()
  },
  created() {
    // if (this.params.dimension) this.dimension = this.params.dimension
    // if (this.params.level) this.level = this.params.level
    this.settings.yAxisName = [this.langs.hour]
    Object.keys(this.params).forEach(key => {
      this.$watch(`params.${key}`, this.refresh)
    })
    screenfull.on('change', () => {
        this.isFullscreen = screenfull.isFullscreen
    });
  },
  methods: {
    /**
     * 查询数据
    */
    dataFn() {
      const params = {
        operatorIdArray: this.params.operatorIdArray ? this.params.operatorIdArray.join(',') : '',
        startDate: this.params.startDate ? this.params.startDate + (this.params.startDate.indexOf('00:00:00') === -1 ? ' 00:00:00' : '') : null,
        endDate: this.params.endDate ? this.params.endDate + (this.params.endDate.indexOf('23:59:59') === -1 ? ' 23:59:59' : '') : null,
      }
      this.postParams = { ...params }
      return staffApi.getEmployeesInquiryLimit(params).then(res => {
        // console.error(res, 'res')
        const data = res.data ? res.data.map(it => {
          return {
            ...it,
            inquiryLimit: (+it.inquiryLimit).toFixed(2)
          }
        }) : []
        this.$emit('dataChange', {
          data
        })
        return {
          columns:[this.langs.name, this.langs.enquiries_hour],
          rows: data.map(it => {
            return {
              [this.langs.name]: it.dimensionValue,
              [this.langs.enquiries_hour]: it.inquiryLimit
            }
          })
        }
      })
    },
    // handleTargetSetting() {
    //   this.helper.modal.open(TargetAmountSetting, {
    //     parent: this
    //   }).then(res => {
    //     console.log(res)
    //     this.refresh();
    //   })
    // },
    // 刷新表格
    refresh() {
      this.$refs.chart.refresh()
    }
  },
  watch: {
    'dimension'() {
      this.refresh();
    },
    'level'() {
      this.refresh();
    },
    // 多语言重新加载图表
    '$i18n.locale'(val) {
      this.settings.yAxisName = [this.langs.hour]
      this.refresh();
    }
  }
}
</script>
