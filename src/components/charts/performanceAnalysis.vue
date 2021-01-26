<template>
<div :class="{'summary-item': !inDetail}">
  <div class="item-content">
    <!-- 图标title -->
    <div class="item-title" v-if="!inDetail">
      <!-- <div class="fr h">
        <view-button :params="postParams" path="performanceAnalysisDetail" :inCockpit="$attrs.inCockpit"></view-button>
        <dashboard-button class="m-l-20" :chartName="$options.name"></dashboard-button>
      </div> -->
      <slot name="header"></slot>
      <!-- 业绩分析 -->
      <span class="ft-pingfang">
        {{langs.performanceAnalysis}}
      </span>
    </div>
    <!-- 图标内容 -->
    <div class="item-chart">
      <!-- 图标 -->
      <div class="w ft-chart">
        <div class="chart-summary">
          <!-- 设置目标金额 -->
          <!-- <span class="fr">
            <span class="link" v-if="!isFullscreen && permissions.targetAmountSetting && !$attrs.inCockpit" @click="handleTargetSetting">{{langs.setTartgetAmount}}</span>
            <span class="bf-bar" :class="{isFullscreen: isFullscreen || !permissions.targetAmountSetting || $attrs.inCockpit}">{{`${langs.targetAmount}(${currencyStr})`}}：{{totalTargetAmount}}</span>
          </span> -->
          <!-- 统计时间 -->
          {{langs.statisticsTime}}：{{params.startDate}} ~ {{params.endDate}}
          <i v-if="showDatePicker" class="el-icon-date cursor m-l-5" @click="mountPicker($event, params)"></i>
        </div>
        <!-- <hide-button class="detail-fixed-btn" v-show="inDetail" v-model="visible"></hide-button> -->
        <!-- <chart-type-switch :style="{'right': switchRight}" class="detail-fixed-switch" v-show="inDetail && visible" :chart="chartIns" :types="['histogram', 'line']" :currentType="settings.type"></chart-type-switch> -->
        <div v-show="visible">
            <!-- 设置目标金额 -->
            <!-- <span style="position: absolute; right: 100px;z-index: 99;" v-if="inDetail">
              <span class="link" v-if="permissions.targetAmountSetting" @click="handleTargetSetting">{{langs.setTartgetAmount}}</span>
              <span class="bf-bar" :class="{isFullscreen: !permissions.targetAmountSetting}">{{`${langs.targetAmount}(${currencyStr})`}}：{{totalTargetAmount}}</span>
            </span> -->
            <chart-dimension :data="chartDimension" v-model="dimension"></chart-dimension>
              <div class="fix-department" v-if="department2 && dimension === 3">
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
 * 业绩分析图表
*/
/* eslint-disable */
import staffApi from 'api/staffApi'
import commonApi from 'api/commonApi'
import dateRange from './dateRange'
import screenfull from 'screenfull'
export default {
  name: 'performanceAnalysis',
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
  // components: {
  //   TargetAmountSetting
  // },
  computed: {
    langs() {
      const t = this.$t;
      return Object.assign({}, t('base'), t('staff.performance'), t('staff.performance.chart'))
    },
    switchRight() {
      let totalTargetAmount = this.totalTargetAmount + '';
      return 300 + totalTargetAmount.length * 8 + 'px'
    }
  },
  data() {
    return {
      // 总目标金额
      totalTargetAmount: 0,
      // 维度
      dimension: 1,
      department2: false,
      // 部门等级
      level: 1,
      chartDimension: [{
        text: '业绩趋势',
        value: 1,
        lang: 'performanceTrends'
      }, {
        text: '员工',
        value: 2,
        lang: 'staff'
      }, {
        text: '部门',
        value: 3,
        lang: 'department'
      }],
      settings: {
        type: 'histogram',
        yAxisName: ['金额'],
        // yAxisName: [amount],
        lang: 'company'
      },
      visible: true,
      // params 克隆对象
      postParams: {},
      // 当前是否是全屏
      isFullscreen: false
    }
  },
  created() {
    if (this.params.dimension) this.dimension = this.params.dimension
    if (this.params.level) this.level = this.params.level
    // console.error('chart init')
    this.settings.yAxisName = [this.langs.amount]
    // console.error(this.params)
    Object.keys(this.params).forEach(key => {
      this.$watch(`params.${key}`, this.refresh)
    })
    commonApi.getOperatorsTree({ manager: 0, type: 1 }).then(res => {
      const treeData = res.data;
      // 删除 公司维度
      if (treeData.length > 1) {
        this.chartDimension.push({
          text: '公司',
          value: 4,
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
        // ...this.params,
        operatorIdArray: this.params.operatorIdArray ? this.params.operatorIdArray.join(',') : '',
        dimension: this.dimension,
        startDate: this.params.startDate ? this.params.startDate + ' 00:00:00' : null,
        endDate: this.params.endDate ? this.params.endDate + ' 23:59:59' : null
      };
      if (this.dimension === 3) {
        params.level = this.level;
      }
      if (this.dimension === 4) {
        params.level = 0;
      }
      this.postParams = {
        ...params,
        startDate: this.params.startDate,
        endDate: this.params.endDate,
        operatorIdArray: this.params.operatorIdArray
      }
      return staffApi.getByEmployees(params).then(res => {
        console.log(res)
        const data = res.data
        let rows = data.map(it => {
            let item = {}
            if (this.dimension === 1) {
              item[this.langs.date] = it.signDate
            } else {
              let ditem = this.chartDimension.find(it => it.value === this.dimension)
              if (ditem) {
                item[this.langs[ditem.lang]] = it.dimensionName;
              }
            }
            Object.assign(item, {
              [this.langs.totalAmount]: it.totalAmount,
              [this.langs.targetAmount]: it.totalTarget
            })
            return item;
        })
        this.totalTargetAmount = data.reduce((total, current) => {
          return total + current.totalTarget
        }, 0)
        this.$emit('dataChange', {
          firstColumnName: Object.keys(rows[0])[0],
          data: data
        })
        // console.error({
        //   columns: Object.keys(rows[0]),
        //   rows
        // })
        return {
          columns: Object.keys(rows[0]),
          rows
        };
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
      this.settings.yAxisName = [this.langs.amount]
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
