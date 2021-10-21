<template>
  <div :class="{'summary-item': !inDetail}">
    <div class="item-content">
      <div class="item-title" v-if="!inDetail">
        <!-- <div class="fr h">
          <view-button :params="postParams" path="staffFollowUpMethod" :inCockpit="$attrs.inCockpit"></view-button>
          <dashboard-button class="m-l-20" :chartName="$options.name"></dashboard-button>
        </div> -->
        <slot name="header"></slot>
        <!-- 员工跟进统计 -->
        <span class="ft-pingfang">
            {{langs.staffFollowStatic}}
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
          <!-- <chart-dimension :data="chartDimension" v-show="visible" v-model="dimension"></chart-dimension> -->
          <!-- <chart-type-switch class="detail-fixed-switch" v-show="inDetail && visible" :chart="chartIns" :types="['histogram', 'line']" :currentType="settings.type"></chart-type-switch> -->
          <!-- <hide-button class="detail-fixed-btn" v-show="inDetail" v-model="visible"></hide-button> -->
          <chart v-show="visible" ref="chart" :dataFn="dataFn" :showChart="visible" :settings="settings" :legendVisible="false"></chart>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
/**
 * @author chenxin <542501270@qq.com>
 * @time 2020年07月13日 14:51:11 星期一
 * @desc 邮件分布 图表
 * @vue-computed {Object} langs - 多语言翻译对象
 */

import staffApi from 'api/staffApi'
import dateRange from './dateRange'
import { transferPropertyArrayToString } from '@/utils/es.js'
export default {
    name: 'staffFollowUpMethodChart',
    mixins: [dateRange],
    data() {
        return {
            settings: {
                type: 'histogram',
                yAxisName: ['数量']
            },
            // 克隆对象
            postParams: {},
            visible: true
        }
    },
    computed: {
        langs() {
            return Object.assign({}, this.$t('base'), this.$t('staff.followStatic'))
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
    created() {
        Object.keys(this.params).forEach(key => {
            this.$watch(`params.${key}`, () => {
                this.refresh();
            })
        })
    },
    watch: {
        // 多语言重新加载图表
        '$i18n.locale'() {
            this.refresh();
        }
    },
    methods: {
        /**
         * 查询展示 数据
         */
        dataFn() {
            let params = {
                ...this.params
            }
            this.postParams = params
            let columns = [this.langs.staff, this.langs.notContacted, this.langs.contacted]
            return staffApi.getEmployeesFollowMethod(transferPropertyArrayToString(params)).then(resp => {
                if (resp.success) {
                    console.error(resp, 'resp')
                    this.totalNum = 0
                    this.setLang()
                    let arr = (resp.data.values || []).map(it => {
                        return {
                            [this.langs.staff]: it.operatorName,
                            [this.langs.notContacted]: it.notContacted,
                            [this.langs.contacted]: it.contacted
                        }
                    })
                    this.$emit('dataChange', resp.data)
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
            this.$refs.chart.changeHandler(info)
        },
        // 刷新表格
        refresh() {
            this.$refs.chart.refresh()
        },
        /**
         * 切换语言
        */
        setLang() {
            this.settings.xAxisName = this.langs.staff
            this.settings.yAxisName = [this.langs.number]
        }
    }
}
</script>

<style lang="scss" scoped>
.ft-chart {
  position: relative;
}
</style>
