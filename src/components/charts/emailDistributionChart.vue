<template>
  <div :class="{'summary-item': !inDetail}">
    <div class="item-content">
      <div class="item-title" v-if="!inDetail">
        <!-- <div class="fr h">
          <view-button :params="postParams" path="emailDistribution" :inCockpit="$attrs.inCockpit"></view-button>
          <dashboard-button class="m-l-20" :chartName="$options.name"></dashboard-button>
        </div> -->
        <slot name="header"></slot>
        <!-- 邮件分布 -->
        <span class="ft-pingfang">
            {{langs.emailDistribution}}
            <!-- <span class="title-desc m-l-20">{{langs.emailTotal}}：{{totalNum}}</span> -->
        </span>
      </div>
        <!-- 图标内容 -->
      <div class="item-chart">
        <!-- 图标 -->
        <div class="w ft-chart">
          <div class="chart-summary" v-if="showTotalWrap">
            <!-- <span class="fr">{{langs.emailTotal}}：{{totalNum}}</span> -->
            <!-- 统计时间 -->
            {{langs.statisticsTime}}：{{params.startDate | timeWithoutHourSecondMinute}} ~ {{params.endDate | timeWithoutHourSecondMinute}}
            <i v-if="showDatePicker" class="el-icon-date cursor m-l-5" @click="mountPicker($event, params)"></i>
          </div>
          <chart-dimension :data="chartDimension" v-show="visible" v-model="dimension"></chart-dimension>
            <!-- <chart-type-switch class="detail-fixed-switch" v-show="inDetail && visible" :chart="chartIns" :types="['histogram', 'line']" :currentType="settings.type"></chart-type-switch> -->
          <hide-button class="detail-fixed-btn" v-show="inDetail" v-model="visible"></hide-button>
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

import emailApi from 'api/emailApi'
import dateRange from './dateRange'
export default {
    name: 'emailDistributionChart',
    mixins: [dateRange],
    data() {
        return {
            chartDimension: [{
                text: '员工',
                value: 1,
                lang: 'staff'
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
                text: '国家/地区',
                value: 2,
                lang: 'regions',
                permitCode: 'displayRegion'
            }],
            settings: {
                type: 'histogram',
                radius: [60, 130],
                offsetY: '45%',
                xAxisType: 'category',
                metrics: ['totalAmountSend', 'totalAmountReceive'],
                labelMap: {
                    totalAmountSend: '我方回复数',
                    totalAmountReceive: '对方回复数',
                    dimensionValue: '日期'
                },
                xAxisName: '员工',
                yAxisName: ['数量', ''],
                legendName: {
                    dimensionValue: '日期'
                }
            },
            dimension: 1, // 维度 id
            // 克隆对象
            postParams: {},
            totalNum: 0,
            visible: true
        }
    },
    computed: {
        langs() {
            return Object.assign({}, this.$t('base'), this.$t('chartDimension'), this.$t('email'), this.$t('staff.salesmanpk'))
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
        this.settings.xAxisName = this.langs.staff
        this.settings.yAxisName = [this.langs.number, '']
        this.settings.labelMap.totalAmountSend = this.langs.sentCount
        this.settings.labelMap.totalAmountReceive = this.langs.receivedCount
        this.settings.labelMap.dimensionValue = this.langs.date
        this.settings.legendName.dimensionValue = this.langs.date

        Object.keys(this.params).forEach(key => {
            this.$watch(`params.${key}`, () => {
                this.refresh();
            })
        })
    },
    watch: {
        // 多语言重新加载图表
        '$i18n.locale'() {
            this.settings.xAxisName = this.langs.staff
            this.settings.yAxisName = [this.langs.number, '']
            this.settings.labelMap.totalAmountSend = this.langs.sentCount
            this.settings.labelMap.totalAmountReceive = this.langs.receivedCount
            this.settings.labelMap.dimensionValue = this.langs.date
            this.settings.legendName.dimensionValue = this.langs.date
            this.refresh();
        },
        'dimension'(val) {
            this.changeActive({
                type: 'dimension',
                value: this.dimension
            });
            this.settings.xAxisName = this.chartDimension.filter(item=>{ return item.value === val })[0].text
        }
    },
    methods: {
        /**
         * 查询展示 数据
         */
        dataFn() {
            let params = {
                dimension: this.dimension
            }
            if (this.params) {
                /* eslint-disable no-restricted-syntax */
                /* eslint-disable guard-for-in */
                for (let i in this.params) {
                    if (this.params[i] !== '') {
                        params[i] = this.params[i]
                    }
                }
            }
            this.postParams = params
            let columns = ['dimensionValue', 'totalAmountSend', 'totalAmountReceive']
            return emailApi.getEmailDistribution(params).then(resp => {
                if (resp.success) {
                    let arr = []
                    this.totalNum = 0
                    resp.data.forEach(item => {
                        arr.push({
                            dimensionValue: this.$i18n.locale === 'zh' ? (item.dimensionValue || this.langs.unknown) : item.dimensionValueEn,
                            totalAmountSend: item.totalAmountSend,
                            totalAmountReceive: item.totalAmountReceive
                        })
                    })
                    this.$emit('getData', {
                        data: resp.data,
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
            this.$refs.chart.changeHandler(info)
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
</style>
