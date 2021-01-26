<template>
  <div :class="{'summary-item': !inDetail}" :ref="`pk-${_uid}`">
    <div class="item-content">
      <div class="item-title" v-if="!inDetail">
        <!-- <div class="fr h">
          <view-button :params="postParams" path="conversionAnalysis" :inCockpit="$attrs.inCockpit"></view-button>
          <dashboard-button class="m-l-20" :chartName="$options.name"></dashboard-button>
        </div> -->
        <slot name="header"></slot>
        <!-- 业绩分析 -->
        <span class="ft-pingfang">{{langs.conversionAnalysis}}</span>
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
            <div class="fix-department" v-if="department2 && dimension === 2">
              <!-- 一级部门 -->
              <el-radio v-model="level" :label="1">{{langs.level1}}</el-radio>
              <!-- 二级部门 -->
              <el-radio v-model="level" :label="2">{{langs.level2}}</el-radio>
            </div>
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
  name: 'conversionAnalysisChart',
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
      return Object.assign({}, t('base'), t('staff.salesmanpk'), t('staff.conversionAnalysis'))
    }
  },
  data() {
    return {
      visible: true,
      // 所有信息
      toalResult: null,
      department2: false,
      // 维度
      dimension: 1,
      level: 1,
      chartDimension: [{
        text: '员工',
        value: 1,
        lang: 'staff'
      }, {
        text: '部门',
        value: 2,
        lang: 'department'
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
    if (this.$refs.tooltip && this.$refs.tooltip.popperVM) {
      this.$el.appendChild(this.$refs.tooltip.popperVM.$el)      
    }
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
    commonApi.getOperatorsTree({ manager: 0, type: 1 }).then(res => {
      const treeData = res.data;
      // 删除 公司维度
      if (treeData.length > 1) {
        this.chartDimension.push({
          text: '公司',
          value: 3,
          lang: 'company'
        });
      }
      // 确认是否有二级部门
      for(let item of treeData) {
        if (item.children && item.children.length > 0) {
          for(let child of item.children) {
            if (child.children && child.children) {
              for(let gradChild of child.children) {
                if (gradChild.department) {
                  return this.department2 = true;
                }
              }
            }
          }
        }
      }
    })
  },
  methods: {
    /**
     * 查询数据
    */
    dataFn() {
      const params = {
        operatorIdArray: this.params.operatorIdArray ? this.params.operatorIdArray.join(',') : '',
        dimension: this.dimension,
        startDate: this.params.startDate ? this.params.startDate + ' 00:00:00' : null,
        endDate: this.params.endDate ? this.params.endDate + ' 23:59:59' : null,
      }
      if (this.dimension === 2) {
        params.level = this.level;
      }
      this.postParams = {
        ...params,
        startDate: this.params.startDate,
        endDate: this.params.endDate,
        operatorIdArray: this.params.operatorIdArray,
        level: params.level,
      }
      return staffApi.getEmployeesTransformAnalysis(params).then(res => {
        console.log(res)
        this.$emit('dataChange', {
          data: res.data
        })
        return {
          columns: [this.langs.name, this.langs.newPotentialCustomerNum, this.langs.transformCustomerNum],
          rows: res.data.map(it => {
            return {
              [this.langs.name]: it.dimensionValue,
              [this.langs.newPotentialCustomerNum]: it.totalNumPotentialCustomer,
              [this.langs.transformCustomerNum]: it.totalNumPartnerCustomer
            }
          })
        }
      })
      // return new Promise((resolve) => {
      //   resolve({
      //     columns: ['业务员', '新增潜在客户数', '转化合作客户数'],
      //     rows: [
      //       { '业务员': '业务员A', '新增潜在客户数': 1393, '转化合作客户数': 1093 },
      //       { '业务员': '业务员B', '新增潜在客户数': 3530, '转化合作客户数': 3230 },
      //       { '业务员': '业务员C', '新增潜在客户数': 2923, '转化合作客户数': 2623 },
      //       { '业务员': '业务员D', '新增潜在客户数': 1723, '转化合作客户数': 1423 },
      //       { '业务员': '业务员E', '新增潜在客户数': 3792, '转化合作客户数': 3492 },
      //       { '业务员': '业务员F', '新增潜在客户数': 4593, '转化合作客户数': 4293 },
      //       { '业务员': '业务员G', '新增潜在客户数': 4593, '转化合作客户数': 4293 },
      //       { '业务员': '业务员H', '新增潜在客户数': 4593, '转化合作客户数': 4293 },
      //     ]
      //   })
      // })
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
    },
    'level'(val) {
      this.refresh()
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
