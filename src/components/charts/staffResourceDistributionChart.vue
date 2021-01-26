<template>
  <div :class="{'summary-item': !inDetail}">
  <div class="item-content">
    <!-- 图标title -->
    <div class="item-title" v-if="!inDetail">
      <!-- <div class="fr h">
        <view-button :params="postParams" path="resourceDistribution" :inCockpit="$attrs.inCockpit"></view-button>
        <dashboard-button class="m-l-20" :chartName="$options.name"></dashboard-button>
      </div> -->
      <slot name="header"></slot>
      <!-- 业绩分析 -->
      <span class="ft-pingfang">
        {{langs.resourceDistribution}}
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
        <!-- <hide-button class="detail-fixed-btn" v-show="inDetail" v-model="visible"></hide-button> -->
        <!-- <chart-type-switch class="detail-fixed-switch" v-show="inDetail && visible" :chart="chartIns" :types="['histogram', 'line', 'ring']" :currentType="settings.type"></chart-type-switch> -->
        <chart-bottom-dimension v-show="visible" :data="bottomDimensionList" v-model="bottomDimension"></chart-bottom-dimension>
        <div v-show="visible">
            <chart-dimension :data="chartDimension" v-model="dimension"></chart-dimension>
            <div class="fix-department" v-if="department2 && dimension === 2">
              <!-- 一级部门 -->
              <el-radio v-model="level" :label="1">{{langs.level1}}</el-radio>
              <!-- 二级部门 -->
              <el-radio v-model="level" :label="2">{{langs.level2}}</el-radio>
            </div>
            <chart ref="chart" :dataFn="dataFn" :showChart="visible" :legend="{show: false}" @chart-click="$emit('chart-click', $event)" :settings="settings"></chart>
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
  name: 'resourceDistribution',
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
    // ...mapGetters({
    //   managedOperatorTree: 'getManagedOperatorTree'
    // }),
    langs() {
      const t = this.$t;
      return Object.assign({}, t('base'), t('chartDimension'), t('staff.resourceDistribution'))
    }
  },
  data() {
    return {
      // 维度
      dimension: 1,
      department2: false,
      bottomDimension: 0,
      bottomDimensionList: [
        {value: 0, lang: {zh: '客户', en: 'customer'}},
        {value: 1, lang: {zh: '商业数据', en: 'data'}},
        {value: 2, lang: {zh: 'EDM额度', en: 'edm'}},
        {value: 3, lang: {zh: '供应商', en: 'supplier'}},
        {value: 4, lang: {zh: '产品', en: 'product'}},
        {value: 5, lang: {zh: '线索', en: 'clue'}},
      ],
      // 部门等级
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
        yAxisName: ['数量'],
      },
      visible: true,
      // params 克隆对象
      postParams: {},
      // 当前是否是全屏
      isFullscreen: false,
      echartRef: null,
      // 保存chart数据 底部字段切换的时候 不需要重新调接口
      chartData: [],
    }
  },
  mounted() {
    // this.dataFn()
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
  created() {
    if (this.params.dimension) this.dimension = this.params.dimension
    if (typeof this.params.bottomDimension === 'number') this.bottomDimension = this.params.bottomDimension
    if (this.params.level) this.level = this.params.level
    // console.error('chart init')
    this.settings.yAxisName = [this.langs.number]
    // console.error(this.params)
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
    dataFn({noAxios}) {
      if (noAxios) return this.getchartDataBydimension()
      const params = {
        // ...this.params,
        operatorIdArray: this.params.operatorIdArray ? this.params.operatorIdArray.join(',') : '',
        dimension: this.dimension,
        startDate: this.params.startDate ? this.params.startDate + ' 00:00:00' : null,
        endDate: this.params.endDate ? this.params.endDate + ' 23:59:59' : null,
      };
      if (this.dimension === 2) {
        params.level = this.level;
      }
      this.postParams = {
        ...params,
        startDate: this.params.startDate,
        endDate: this.params.endDate,
        operatorIdArray: this.params.operatorIdArray,
        level: params.level,
        bottomDimension: this.bottomDimension
      }
      return staffApi.getEmployeesResourceDistributed(params).then(res => {
        this.chartData = res.data
        this.$emit('dataChange', {
          fisrtColumn: this.langs[['operatorName', 'department', 'company'][this.dimension - 1]],
          data: this.chartData
        })
        return this.getchartDataBydimension()
      })
    },
    /**
     * 根据底部字段返回chart数据
    */
    getchartDataBydimension() {
      const dimensionsLabel = ['operatorName', 'department', 'company']
      const bottomDimensionLabel = ['totalNumCustomer', 'totalNumBusinessDataDecrypted', 'totalNumEdmLimit', 'totalNumSupplier', 'totalNumProduct', 'totalNumClue']
      const bottomDimensionLegend = ['customerNum', 'businessNum', 'EDMQuota', 'supplierNum', 'productNum', 'clueNum']
      let res = {
        _dimensionKey: this.langs[dimensionsLabel[this.dimension - 1]],
        columns: [this.langs[dimensionsLabel[this.dimension - 1]], this.langs[bottomDimensionLegend[this.bottomDimension]]],
        rows: this.chartData.map(it => { 
          return {
            [this.langs[dimensionsLabel[this.dimension - 1]]]: it.dimensionValue,
            [this.langs[bottomDimensionLegend[this.bottomDimension]]]: it[bottomDimensionLabel[this.bottomDimension]]
          }
        })
      }
      return res;
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
    refresh(params) {
      this.$refs.chart.refresh(params)
    }
  },
  watch: {
    'dimension'() {
      this.refresh();
    },
    'level'() {
      this.refresh();
    },
    'bottomDimension'() {
      this.postParams.bottomDimension = this.bottomDimension
      this.refresh({noAxios: true})
    },
    // 多语言重新加载图表
    '$i18n.locale'(val) {
      this.settings.yAxisName = [this.langs.number]
      this.refresh();
    }
  }
}
</script>
