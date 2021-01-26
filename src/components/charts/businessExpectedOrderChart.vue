<template>
<div :class="{'summary-item': !inDetail}">
  <div class="item-content">
    <!-- 图标title -->
    <div class="item-title" v-if="!inDetail">
      <!-- <div class="fr h">
        <view-button :params="postParams" path="businessExpectedOrder" :inCockpit="$attrs.inCockpit"></view-button>
        <dashboard-button class="m-l-20" :chartName="$options.name"></dashboard-button>
      </div> -->
      <slot name="header"></slot>
      <!-- 商机预期成单 -->
      <span class="ft-pingfang">
        {{langs.title}}
      </span>
    </div>
    <!-- 图标内容 -->
    <div class="item-chart">
      <!-- 图标 -->
      <div class="w ft-chart">
        <div class="chart-summary">
          <!-- <span class="fr">{{langs.businessTotal}}：{{totalNum}}</span> -->
          <!-- 统计时间 -->
          {{langs.statisticsTime}}：{{params.startDate}} ~ {{params.endDate}}
          <i v-if="showDatePicker" class="el-icon-date cursor m-l-5" @click="mountPicker($event, params)"></i>
        </div>
        <!-- <hide-button class="detail-fixed-btn" v-show="inDetail" v-model="visible"></hide-button> -->
        <!-- <chart-type-switch style="right: 100px;" class="detail-fixed-switch" v-show="inDetail && visible" :chart="chartIns" :types="['histogram', 'line']" :currentType="settings.type"></chart-type-switch> -->
        <div v-show="visible">
            <chart-dimension :data="chartDimension" v-model="dimension"></chart-dimension>
            <chart ref="chart" :dataFn="dataFn" :showChart="visible" :settings="settings"></chart>
        </div>
      </div>
    </div>
  </div>
</div>
</template>

<script>
/**
 * @module: /joinf-statistics-vuejs/src/components/charts/businessExpectedOrderChart.vue
 * @description: 商机预期成单
 * @author: 万焕昌 <1109923832@qq.com>
 * @time: 2020-11-23 16:23:54 Monday
*/
/* eslint-disable */
import businessApi from 'api/businessApi'
import { transferPropertyArrayToString } from '@/utils/es.js'
import dateRange from './dateRange'
export default {
  name: 'businessExpectedOrderChart',
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
      return Object.assign({}, t('base'), t('business'), t('business.businessExpectedOrder'))
    }
  },
  data() {
    return {
      // 总目标金额
      totalTargetAmount: 0,
      // 维度
      dimension: 1,
      chartDimension: [{
        text: '商机名称',
        value: 1,
        lang: 'businessName'
      }, {
        text: '国家/地区',
        value: 2,
        lang: 'regions'
      }, {
        text: '客户等级',
        value: 3,
        lang: 'customerGrade'
      }, 
      // {
      //   text: '客户标签',
      //   value: 4,
      //   lang: 'customerTags'
      // }, 
      {
        text: '主营产品',
        value: 4,
        lang: 'mainProducts'
      }, {
        text: '客户来源',
        value: 5,
        lang: 'sourceName'
      }],
      settings: {
        type: 'histogram',
        yAxisName: ['金额'],
        // yAxisName: [amount],
        lang: 'company'
      },
      visible: true,
      // params 克隆对象
      postParams: {}
    }
  },
  created() {
    Object.keys(this.params).forEach(key => {
      this.$watch(`params.${key}`, this.refresh)
    })
  },
  methods: {
    /**
     * 查询数据
    */
    dataFn() {
      const params = {
        ...this.params,
        dimension: this.dimension,
      }
      this.postParams = params
      return businessApi.getBusinessExpectedOrder(transferPropertyArrayToString(params)).then(res => {
        const lang = this.$i18n.locale
        const langs = {
          1: {
            zh: '商机名称',
            en: 'business'
          },
          2: {
            zh: '国家',
            en: 'region'
          },
          3: {
            zh: '客户等级',
            en: 'grade'
          },
          4: {
            zh: '主营产品',
            en: 'mainProduct'
          },
          5: {
            zh: '客户来源',
            en: 'source'
          }
        }
        let xName = langs[this.dimension][lang]
        this.settings.xAxisName = xName
        let yName = `${this.langs.amount}(USD)`
        this.settings.yAxisName = [yName]
        let rows = res.data.map(it => {
          return {
            ...it,
            label: lang === 'zh' ? it.dimensionValue : (it.dimensionValueEn || it.dimensionValue),
            value: it.totalAmount,
            [yName]: it.totalAmount
          }
        })
        this.$emit('dataChange', {
          firstColumnName: xName,
          data: rows
        })
        return {
          columns: ['label', yName],
          rows
        };
      })
    },
    // 刷新表格
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
  .bf-bar::before{
    content: '';
    display: inline-block;
    width: 1px;
    height: 12px;
    position: relative;
    top: 2px;
    margin-left: 7px;
    margin-right: 5px;
    background:  #D9DEE5;
  }
  .bf-bar.isFullscreen::before{
    display: none;
  }
.ft-chart{
  position: relative;

}
</style>
