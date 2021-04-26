// import { DatePicker } from 'element-ui'
import { globalConfig } from '@/components/index.js'
import Vue from 'vue'
// import storage from '@/views/dashboard/components/storage'
export const chartTypeSession = 'chartTypeSession'
/**
 * 提供 驾驶舱 日期选择功能
 * 2020.08.28 --新增字段 chartIns 指向 chart 实例
 *            --新增字段 initChartType 保存初始化图表类型
 *                      初始化值 从 localstorage 中 取出
 * 2020.09.02 --新增功能 16506 显示影藏切换 设置概览表高度
 *              新增 visible watch
*/
export default {
  props: {
    showDatePicker: {
      type: Boolean,
      default: () => false
    }
  },
  watch: {
    visible() {
      // console.log(this.$parent)
      if (this.$parent.$refs.chart) {
        const el = this.$parent.$el.querySelector('.detail-table-wapper .el-scrollbar');
        if (el) {
          if (!this.visible) {
            let height = document.body.clientHeight;
            if (height > 450) {
              // el.style.height = height - 340 + 'px'
              height -= 340
            }
            height = 36 * this.$parent.tableData.length > height ? height : 36 * this.$parent.tableData.length
            el.style.height = height + 'px'
          } else {
            el.style.height = this.$parent.tableData.length > 4 ? '200px' : 36 * this.$parent.tableData.length + 'px'
          }
          if (this.$parent.$refs.scrollbar) {
            this.$parent.$refs.scrollbar.update()
          }
        }
      }
    }
  },
  data() {
    // console.warn(this.$options.name)
    let name = this.$options.name
    let type = ''
    let session = localStorage.getItem(chartTypeSession)
    if (session) {
      try {
        session = JSON.parse(session)
        if (session[name]) type = session[name]
      } catch (e) {
        console.warn(`获取${name}图表类型缓存失败，${e}`)
      }
    }
    return {
      height: parseInt(globalConfig.defaultHeight) - 20 + 'px',
      picker: null,
      pickerValue: [],
      chartIns: null,
      initChartType: type
    }
  },
  created() {
    // 修改 图表传入属性setting的 type
    if (this.settings && this.initChartType) {
      this.settings.type = this.initChartType
    }
  },
  mounted() {
    this.chartIns = this.$refs.chart
    if (this.$refs.chart) {
      this.$refs.chart.$on('chart-click', (params) => {
        // console.error(params)
        this.$emit('chart-click', params)
      })
    }
  },
  methods: {
    mountPicker(event, params, callback) {
      this.pickerValue = params.startDate ? [params.startDate, params.endDate] : ['2021-01-01', '2021-01-07'];
      const isInit = !this.picker
      if (isInit) {
        const Picker = Vue.extend(globalConfig.DatePicker)
        this.picker = new Picker({
          parent: this,
          propsData: {
            value: this.pickerValue,
            type: 'daterange',
            size: 'small',
            format: 'yyyy-MM-dd',
            valueFormat: 'yyyy-MM-dd',
            popperClass: 'arrow-left'
          }
        }).$mount();
        // console.log(this.picker)
        this.picker.$el.style.display = 'none'
        event.target.appendChild(this.picker.$el);
        this.picker.$refs.reference = event.target;
      }
      this.picker.showPicker()
      if (isInit) {
        this.picker.$on('input', (date) => {
          // console.log(date)
          // this.picker.value = date;
          // this.pickerValue = date
          // 设置 session storage
          // console.log(this.$options.name)
          // storage.setCockpitStorageByChart(this.$options.name, {
          //   startDate: date[0],
          //   endDate: date[1]
          // })
          this.$set(this.pickerValue, 0, date[0])
          this.$set(this.pickerValue, 1, date[1])
          params.startDate = date[0]
          params.endDate = date[1]
          if (callback && callback instanceof Function) {
            callback();
          }
        })
      }
    }
  },
}
