/* eslint-disable */
/**
 * @module components/chart
 * @author 万焕昌 <1109923832@qq.com>
 * @desc 自定义图标
 * @example 使用方式查看 v-charts官方文档 https://v-charts.js.org/
 * 原基础上 做了 功能扩展
 */
// import screenfull from 'screenfull'
import echartsLib from 'echarts'
// import 'echarts/lib/component/tooltip'
// import 'echarts/lib/component/legend'
import { globalConfig } from '@/components/index.js'
import numerify from 'numerify'
import {
  getType,
  debounce,
  camelToKebab,
  isArray,
  isObject,
  cloneDeep,
  isEqual
} from 'utils-lite'

import Loading from 'vCharts/components/loading'
// import DataEmpty from 'vCharts/components/data-empty'
import {
  DEFAULT_COLORS,
  DEFAULT_THEME,
  STATIC_PROPS,
  ECHARTS_SETTINGS
} from 'vCharts/constants'
import setExtend from 'vCharts/modules/extend'
import setMark from 'vCharts/modules/mark'
import setAnimation from 'vCharts/modules/animation'

// const ringThemeColors = ['#3BA0FF', '#37CBCB', '#4DCB73', '#FFDA6B', '#FFA200', '#F2637B', '#975FE4'];
const ringThemeColors = ['#3BA0FF', '#4DCB73', '#00B3A3', '#FFDA6B', '#FFA200', '#F2637B', '#975FE4', '#96514D', '#E6B422', '#00A381', '#824880', '#BF794E', '#D0AF4C', '#F5B1AA', '#BC64A4'];
const normalThemeColors = ['#95CCF5', '#6AC2F5', '#2DB7F6', '#00A1E8', '#1E80D3', '#1F5AA3'];
let screenfull
export default {
  render (h) {
    return h('div', {
      class: [camelToKebab(this.$options.name || this.$options._componentTag)],
      style: this.canvasStyle
    }, [
      h('div', {
        style: this.canvasStyle,
        class: { 'v-charts-mask-status': this.dataEmpty || this.loading },
        ref: 'canvas'
      }),
      h('div', {
        class: 'el-table__empty-block',
        style: {
          position: 'absolute',
          top: '0',
          bottom: '0',
          left: '0',
          right: '20px',
          background: '#fff',
          display: this.dataEmpty ? '' : 'none'
        }
      }, [
        h('span', {
          class: 'el-table__empty-text',
          domProps: {
            innerHTML: '暂无数据'
          },
        })
      ]),
      h(Loading, {
        style: { display: this.loading ? '' : 'none' }
      }),
      this.$slots.default
    ])
  },

  props: {
    // data: { type: [Object, Array]},
    dataFn: { type: Function, require: true},
    settings: { type: Object, default () { return {} } },
    width: { type: String, default: 'auto' },
    height: { type: String, default: () => globalConfig.defaultHeight },
    beforeConfig: { type: Function },
    afterConfig: { type: Function },
    afterSetOption: { type: Function },
    afterSetOptionOnce: { type: Function },
    events: { type: Object },
    grid: { type: [Object, Array] },
    colors: {
      type: Array,
    },
    tooltipVisible: { type: Boolean, default: true },
    legendVisible: { type: Boolean, default: true },
    legendPosition: { type: String },
    markLine: { type: Object },
    markArea: { type: Object },
    markPoint: { type: Object },
    visualMap: { type: [Object, Array] },
    dataZoom: { type: [Object, Array] },
    toolbox: { type: [Object, Array] },
    initOptions: { type: Object, default () { return {} } },
    title: [Object, Array],
    legend: [Object, Array],
    yAxis: {
      type: [Object, Array],
    },
    xAxis: {
      type: [Object, Array],
    },
    radar: Object,
    tooltip: Object,
    axisPointer: {
      type: [Object, Array],
    },
    brush: [Object, Array],
    geo: [Object, Array],
    timeline: [Object, Array],
    graphic: [Object, Array],
    series: [Object, Array],
    backgroundColor: [Object, String],
    textStyle: [Object, Array],
    animation: Object,
    theme: Object,
    themeName: String,
    // loading: Boolean,
    // dataEmpty: Boolean,
    extend: Object,
    judgeWidth: { type: Boolean, default: false },
    widthChangeDelay: { type: Number, default: 300 },
    tooltipFormatter: { type: Function },
    resizeable: { type: Boolean, default: true },
    resizeDelay: { type: Number, default: 200 },
    changeDelay: { type: Number, default: 0 },
    setOptionOpts: { type: [Boolean, Object], default: true },
    cancelResizeCheck: Boolean,
    notSetUnchange: Array,
    log: Boolean,
    showChart: { type: Boolean, default: true },
  },
  watch: {
    data: {
      deep: true,
      handler (v) { if (v) { this.changeHandler() } }
    },

    settings: {
      deep: true,
      handler (v) {
        if (v.type && this.chartLib) this.chartHandler = this.chartLib[v.type]
        // this.changeHandler()
      }
    },
    legend: {
    },
    grid: {},
    width: 'nextTickResize',
    height: 'nextTickResize',
    yAxis: [],
    events: {
      deep: true,
      handler: 'createEventProxy'
    },

    theme: {
      deep: true,
      handler: 'themeChange'
    },
    themeName: 'themeChange',

    resizeable: 'resizeableHandler',
    tooltip: function() {
      this.dataHandler({}, true)
    }
  },

  computed: {
    canvasStyle () {
      return {
        width: this.width,
        height: this.height,
        position: 'relative'
      }
    },

    chartColor () {
      return this.colors || ((this.settings && ['ring', 'histogram', 'bar'].indexOf(this.settings.type) !== -1) ? ringThemeColors : normalThemeColors) || (this.theme && this.theme.color) || DEFAULT_COLORS
    }
  },

  methods: {
    /**
     * 数据初始化
     */
    async dataHandler (params,noremote) {
      if (!this.chartHandler) return
      let data = this.data
      if (!this.charts && this.dataFn && this.dataFn instanceof Function && !noremote) {
        this.loading = true;
        try {
          data = this.data = await this.dataFn(params || {})
          let key = data._dimensionKey
          if (key && data.rows && Array.isArray(data.rows)) {
            let _cache = {}
            data.rows.forEach(it => {
              if (!_cache[it[key]]) {
                _cache[it[key]] = [it]
              } else {
                _cache[it[key]].push(it)
              }
            })
            Object.values(_cache).forEach((it) => {
              if (it.length > 1) {
                it.forEach((item, idx) => {
                  item[key] = item[key] + (idx + 1)
                })
              }
            })
          }
          this.dataEmpty = false
          if (!data.rows || data.rows.length === 0) {
            this.dataEmpty = true
          }
        } catch(err) {
          this.loading = false;
          this.dataEmpty = true
          console.warn('接口返回数据', err)
          return
          // this.$message.error(`图表${this.$parent.$options.name}接口返回报错`)
          // console.error(err);
        }
        console.log(data, 'await data')
        this.loading = false;
      }
      if (!data) return
      const { columns = [], rows = [] } = data
      const extra = {
        tooltipVisible: this.tooltipVisible,
        legendVisible: this.legendVisible,
        echarts: this.echarts,
        color: this.chartColor,
        tooltipFormatter: this.tooltipFormatter,
        _once: this._once
      }
      if (this.beforeConfig) data = this.beforeConfig(data)

      let options = this.chartHandler(columns, rows, this.settings, extra)
      if (options) {
        if (typeof options.then === 'function') {
          options.then(this.optionsHandler)
        } else {
          this.optionsHandler(options)
        }
      }
    },

    nextTickResize () { this.$nextTick(this.resize) },

    resize () {
      if (!this.cancelResizeCheck) {
        if (this.$el &&
          this.$el.clientWidth &&
          this.$el.clientHeight) {
          this.echartsResize()
        }
      } else {
        this.echartsResize()
      }
    },

    echartsResize () { this.echarts && this.echarts.resize() },

    optionsHandler (options) {
      if (this.settings && this.settings.type === 'pictorialBar') {
        options.series.forEach(it => {
          it.type = 'pictorialBar'
          it.symbol = 'path://M0,10 L10,10 C5.5,10 5.5,5 5,0 C4.5,5 4.5,10 0,10 z'
          it.barCategoryGap = '-100%'
          it.itemStyle = {opacity: 0.5}
          it.emphasis = {temStyle: {opacity: 0.5}}
        })
        options.xAxis[0].boundaryGap = true
        // options.yAxis[0].axisLabel = {
        //   formatter: '{value}%'
        // }
      }
      // legend
      if (this.legendPosition && options.legend) {
        options.legend[this.legendPosition] = 10
        if (~['left', 'right'].indexOf(this.legendPosition)) {
          options.legend.top = 'middle'
          options.legend.orient = 'vertical'
        }
      }
      // color
      options.color = this.chartColor
      // echarts self settings
      ECHARTS_SETTINGS.forEach(setting => {
        if (this[setting]) options[setting] = this[setting]
      })
      // animation
      if (this.animation) setAnimation(options, this.animation)
      // marks
      if (this.markArea || this.markLine || this.markPoint) {
        const marks = {
          markArea: this.markArea,
          markLine: this.markLine,
          markPoint: this.markPoint
        }
        const series = options.series
        if (isArray(series)) {
          series.forEach(item => { setMark(item, marks) })
        } else if (isObject(series)) {
          setMark(series, marks)
        }
      }
      // change inited echarts settings
      if (this.extend) setExtend(options, this.extend)
      if (this.afterConfig) options = this.afterConfig(options)
      let setOptionOpts = this.setOptionOpts
      // map chart not merge
      if ((this.settings.bmap || this.settings.amap) &&
        !isObject(setOptionOpts)) {
        setOptionOpts = false
      }
      // exclude unchange options
      if (this.notSetUnchange && this.notSetUnchange.length) {
        this.notSetUnchange.forEach(item => {
          const value = options[item]
          if (value) {
            if (isEqual(value, this._store[item])) {
              options[item] = undefined
            } else {
              this._store[item] = cloneDeep(value)
            }
          }
        })
        if (isObject(setOptionOpts)) {
          setOptionOpts.notMerge = false
        } else {
          setOptionOpts = false
        }
      }
      if (this._isDestroyed) return
      if (this.log) console.log(options)
      this.defaultDataHandler(options)
      if (!this.echarts) return
      this.echarts.setOption(options, setOptionOpts)
      // 先 移除事件 防止重复添加
      this.echarts.off('click')
      this.echarts.off('datazoom')
      this.echarts.off('legendselectchanged')
      this.echarts.on('click', (params) => {
        // console.log(params)
        this.$emit('chart-click', params);
      })
      if (options.dataZoom) {
        this.echarts.on('datazoom', (obj) => {
          // console.log(obj, options)
          this.dataZoomObj = {
            start: obj.start,
            end: obj.end
          }
        })
      }
      if (options._refreshBarRadius && options._refreshBarRadius instanceof Function) {
        this.echarts.on('legendselectchanged', (obj) => {
          let arr = [];
          Object.keys(obj.selected).forEach(key => {
            if (obj.selected[key]) {
              arr.push(key)
            }
          })
          options._refreshBarRadius(arr)
          options.legend.selected = obj.selected
          // console.log(options)
          if (this.dataZoomObj) {
            Object.assign(options.dataZoom[0], this.dataZoom)
          }
          this.echarts.setOption(options, setOptionOpts)
          // console.log(arguments)
        })
      }
      this.$emit('ready', this.echarts, options, echartsLib)
      if (!this._once['ready-once']) {
        this._once['ready-once'] = true
        this.$emit('ready-once', this.echarts, options, echartsLib)
      }
      if (this.judgeWidth) this.judgeWidthHandler(options)
      if (this.afterSetOption) this.afterSetOption(this.echarts, options, echartsLib)
      if (this.afterSetOptionOnce && !this._once['afterSetOptionOnce']) {
        this._once['afterSetOptionOnce'] = true
        this.afterSetOptionOnce(this.echarts, options, echartsLib)
      }
    },

    judgeWidthHandler (options) {
      const { widthChangeDelay, resize } = this
      if (this.$el.clientWidth || this.$el.clientHeight) {
        resize()
      } else {
        this.$nextTick(_ => {
          if (this.$el.clientWidth || this.$el.clientHeight) {
            resize()
          } else {
            setTimeout(_ => {
              resize()
              if (!this.$el.clientWidth || !this.$el.clientHeight) {
                console.warn(' Can\'t get dom width or height ')
              }
            }, widthChangeDelay)
          }
        })
      }
    },

    resizeableHandler (resizeable) {
      if (resizeable && !this._once.onresize) this.addResizeListener()
      if (!resizeable && this._once.onresize) this.removeResizeListener()
    },

    init (params) {
      if (this.echarts) return
      const themeName = this.themeName || this.theme || DEFAULT_THEME
      this.echarts = echartsLib.init(this.$refs.canvas, themeName, this.initOptions)
      if (this.data || this.dataFn) this.changeHandler(params)
      this.createEventProxy()
      if (this.resizeable) this.addResizeListener()
    },

    addResizeListener () {
      window.addEventListener('resize', this.resizeHandler)
      this._once.onresize = true
    },

    removeResizeListener () {
      window.removeEventListener('resize', this.resizeHandler)
      this._once.onresize = false
    },

    addWatchToProps () {
      // const watchedVariable = this._watchers.map(watcher => watcher.expression)
      const watchedVariable = Object.keys(this.$options.watch)
      // console.log(this._watchers)
      Object.keys(this.$props).forEach(prop => {
        if (!~watchedVariable.indexOf(prop) && !~STATIC_PROPS.indexOf(prop)) {
          const opts = {}
          if (~['[object Object]', '[object Array]'].indexOf(getType(this.$props[prop]))) {
            opts.deep = true
          }
          this.$watch(prop, () => {
            this.changeHandler()
          }, opts)
        }
      })
    },

    createEventProxy () {
      // 只要用户使用 on 方法绑定的事件都做一层代理，
      // 是否真正执行相应的事件方法取决于该方法是否仍然存在 events 中
      // 实现 events 的动态响应
      const self = this
      const keys = Object.keys(this.events || {})
      keys.length && keys.forEach(ev => {
        if (this.registeredEvents.indexOf(ev) === -1) {
          this.registeredEvents.push(ev)
          this.echarts.on(ev, (function (ev) {
            return function (...args) {
              if (ev in self.events) {
                self.events[ev].apply(null, args)
              }
            }
          })(ev))
        }
      })
    },

    themeChange (theme) {
      this.clean()
      this.echarts = null
      this.observerOnce()
    },

    clean () {
      if (this.resizeable) this.removeResizeListener()
      if (this.echarts != null) {
        this.echarts.dispose()
      }
    },

    observerOnce(params) {
      let _this = this
      this.observer = new IntersectionObserver(((entries) => {
        let called = false;
        return (entries) => {
          if (called) return;
          if (entries[0].intersectionRatio > 0 || !_this.showChart) {
            called = true;
            this.init(params)
          }
        }
      })());
      this.observer.observe(this.$refs.canvas)
    },

    refresh(params) {
      this.echarts = null;
      this.observerOnce(params)
    },

    /**
     * 默认数据样式 设置
    */
    defaultDataHandler(options) {
      const series = Array.isArray(options.series) ? options.series : [options.series];
      /**
       * 修改 pie 图 默认样式
      */
     if (series.length === 1 && series[0].type === 'pie') {
       const ser = series[0]
       let height = Number.parseInt(this.height)
       let scale = +(height / 400).toFixed(2)
       let start = scale * 60
       let end = start + 70 * scale
       ser.radius = [start, end]
      //  ser.radius = [60, 130]
       let data = ser.data
       if (data.length > 15) {
        let _data = data.sort((a, b) => b.value - a.value)
        ser.data = [
          ..._data.slice(0, 14),
          {
            name: '其他',
            value: _data.slice(14).reduce((sum, obj) => {
              return sum + obj.value
            }, 0)
          }
        ]
       }
     }
      /**
       * 修改坐标轴样式
      */
     options.grid = options.grid || {};
      /**
       * 修改图例的位置
      */
     options.legend = options.legend || {};
     Object.assign(options.legend, {
       bottom: 16,
       itemWidth: 8,
       itemHeight: 8,
       textStyle: {
         color: screenfull && screenfull.isFullscreen ? '#B6E1FF' : '#6F6C68'
       },
       tooltip: {
        show: true
       }
     })
    //  if (options.series && options.series[0].type === 'funnel') {
    //    options.legend.padding = [20, 5, 5, 5]
    //  }
     if (!options.legend.formatter) {
      options.legend.formatter = (name) => {
        if (!name) return '';
        if (name.length > 10) {
          return name.slice(0,5) + '...';
        }
        return name
      }
     }
     if (!Array.isArray(options.series) && options.series.type === 'funnel') {
        options.series.bottom = 80
     }
     if (Array.isArray(options.series) && options.series[0].type === 'bar' && !this.settings.notBarAxis) {
       options.tooltip.trigger = 'axis'
       options.tooltip.position = function(point, params, dom, rect, size){
         //其中point为当前鼠标的位置，size中有两个属性：viewSize和contentSize，分别为外层div和tooltip提示框的大小
         var x = point[0];//
         var y = point[1];
         var boxWidth = size.contentSize[0];
         var boxHeight = size.contentSize[1];
         var posX = 0;//x坐标位置
         var posY = 0;//y坐标位置
         if(x<boxWidth){//左边放不开
             posX = 5;
         }else{//左边放的下
             posX = x-boxWidth;
         }
         if(y<boxHeight){//上边放不开
             posY = 5;
         }else{//上边放得下
             posY = y-boxHeight;
         }
         return [posX,posY];
       }
     }
     if (Array.isArray(options.series) && options.series[0].type === 'pie' && !this.tooltip) {
        options.tooltip.formatter = '{b}: {c} ({d}%)'
     }
      /**
       * x轴样式
      */
      options.xAxis && (options.xAxis.forEach((it) => {
        let name = this.settings.xAxisName || this.data.columns[0]
        if (!name) return '';
        if (name.length > 10) {
          name = name.slice(0,5) + '...';
        }
        it.name = name
        it.nameLocation = 'end'
        it.nameTextStyle = {
          align: 'left',
          padding: [0, 0, 0, -15]
        }
        if (options.yAxis.length > 1 && !options.yAxis.some(it => !it.name)) {
          it.nameTextStyle.padding = [0, 0, 0, 15]
        }
        it.axisLine = {
          show: true,
          onZero: true,
          lineStyle: {
            color: screenfull && screenfull.isFullscreen ? '#2E5065' : '#E8E8E8'
          },
        }
        it.axisLabel = {
          interval: 0,
          // rotate: 25,
          formatter: name => {
            if (name.length > 10) {
              name = name.slice(0,5) + '...';
            }
            // eslint-disable-next-line
            return name
          }
        }
      }))
      /**
       * y轴样式
      */
     if (options.yAxis) {
      if (!Array.isArray(options.yAxis)) options.yAxis = [options.yAxis]
      const yAxisIndex = series.map(it => +it.yAxisIndex || 0)
      for(let idx = 0; idx < options.yAxis.length; idx ++) {
        if (yAxisIndex.indexOf(idx) === -1) continue
        let it = options.yAxis[idx];
        it.name = this.settings.yAxisName ? this.settings.yAxisName[idx] : this.data.columns[idx + 1]
        it.nameTextStyle = {
            align: 'left',
        }
        if (idx !== 0) {
          it.nameTextStyle = {
            align: 'right',
          }
        }
        it.nameGap = 30
        it.splitLine = it.splitLine || {}
        Object.assign(it.splitLine, {
          lineStyle: {
            color: screenfull && screenfull.isFullscreen ? '#2E5065' : '#E8E8E8',
            type: 'dotted'
          }
        })
      }
     }
      /**
       * 图表文字样式
      */
      options.textStyle = options.textStyle || {};
      Object.assign(options.textStyle, {
        color: screenfull && screenfull.isFullscreen ? '#B6E1FF' : '#6F6C68'
      })
      /**
       * 图表样式
       * 柱状图的radius
      */
      // const seriesReverse = series.reverse();
      let colors = ['#40b0ff', '#37cbcb', '#ffa200']
      for(let i = series.length - 1; i >=0; i--) {
        let serie = series[i]
        if (series[i].name && series[i].name.length > 20) {
          series[i].name = series[i].name.slice(0,15) + '...';
        }
        if (serie.type === 'bar') {
          serie.barMaxWidth = 20
          if (!serie.stack) {
            serie.itemStyle = serie.itemStyle || {};
            Object.assign(serie.itemStyle, {
              barBorderRadius: [30, 30, 0, 0],
            })
          }
        } else if (serie.type === 'pie') {
          serie.minAngle = 10;
        } else if (serie.type ==='line') {
          serie.color = colors[i]
        } else if (serie.type ==='funnel') {
          serie.right = 180
        }
      }
      // options._dataCopy = options.series.map(it => it.data)
      // console.error(keySaveArr)
      if (Array.isArray(options.series) && options.series.find(it => it.type === 'bar' && it.stack)) {
        options._refreshBarRadius = function (arr, _init) {
          // console.log(options.series)
          if (!Array.isArray(options.series) || options.series.filter(it => it.type === 'bar').length === 0) return
          let keySaveArr = []
          let series = options.series.concat().filter(it => {
            if (!arr || arr.length === 0) {
              return true;
            }
            return arr.indexOf(it.name) !== -1
          });
          for(let i = series.length - 1; i >=0; i--) {
            let serie = series[i]
            if (!keySaveArr.includes(serie.stack)) {
              keySaveArr.push(serie.stack);
            }
          }
          if (keySaveArr.length > 0) {
            if (_init) options._dataCopy = {}
            keySaveArr.forEach(key => {
              // options.
              let stacks = series.filter(it => it.stack === key).map(it => it.data)
              series.forEach(ser => ser.itemStyle = {})
              if (_init) options._dataCopy[key] = JSON.parse(JSON.stringify(stacks))
              let indexs = [];
              // TODO 提高 遍历性能
              for(let i = stacks.length - 1; i >= 0; i--) {
                let stack = stacks[i];
                // if (indexs.length === stack.length) break
                for(let j = stack.length -1; j >= 0; j--) {
                  stack[j] = options._dataCopy[key][i][j];
                  // if (indexs.includes(j)) continue
                  if (!indexs.includes(j) && stack[j] && +stack[j] !== 0) {
                    stack[j] = {
                      value: stack[j],
                      itemStyle: {
                        barBorderRadius: [30, 30, 0, 0]
                      }
                    }
                    indexs.push(j)
                  }
                }
              }
            })
          }
        }
        options._refreshBarRadius(null, true);
      }
      // let last =
      // keySaveArr = null;
      // series.forEach(it => {
      //   if (it.type === 'bar') {
      //     console.log(it)
      //     it.barMaxWidth = 20

      //   } else if (it.type === 'pie') {
      //     it.minAngle = 10;
      //   }
      // })
      /**
       * 设置滚动轴
      */
     const needZoom = series.find(it => (it.type === 'bar' || it.type === 'line' || it.type === 'pictorialBar') && it.data.length > 7) || (options.xAxis && options.xAxis.find(it => it.data.length > 7));
     if (needZoom) {
       options.dataZoom = [{
        type: 'slider',
        show: true,
        start: 0,
        end: Math.floor(400/needZoom.data.length),
        xAxisIndex: [0],
        height: 13,
        bottom: 45,
        showDetail: false,
        borderColor: screenfull && screenfull.isFullscreen ? '#2E5065' : '#E8E8E8'
      }]
     }
      // console.log(options)
      // 全局 根据字符 计算长度
      let right = 10
      let xAixs = Array.isArray(options.xAxis) ? options.xAxis[0] : options.xAxis;
      if (xAixs) {
        let xAixsName = Array.isArray(xAixs.name) ? xAixs.name[0] : xAixs.name;
        if (xAixsName) {
          xAixsName.split('').forEach(it => {
          if (/[a-zA-Z]|(\s)/.test(it)) {
            right += 6
          } else {
            right += 12
          }
          })
        }
      }
      Object.assign(options.grid, {
        left: 10,
        right,
        bottom: 70,
        //  width: '93%'
      })
    }
  },

  created () {
    this.echarts = null
    this.registeredEvents = []
    this._once = {}
    this._store = {}
    this.resizeHandler = debounce(this.resize, this.resizeDelay)
    this.changeHandler = debounce(this.dataHandler, this.changeDelay)
    this.addWatchToProps()
  },

  mounted () {
    // this.init()
    this.observerOnce()
    // screenfull.on('change', () => {
    //   if (this.echarts) {
    //     const color = screenfull && screenfull.isFullscreen ? '#B6E1FF' : '#6F6C68'
    //     const border = screenfull && screenfull.isFullscreen ? '#2E5065' : '#E8E8E8'
    //     let optionObj = {
    //       grid: {
    //         borderColor: border
    //       },
    //       textStyle: {
    //         color
    //       },
    //       legend: {
    //         textStyle: {
    //           color
    //         }
    //       }
    //     }
    //     let options = this.echarts.getOption();
    //     if (options.xAxis) {
    //       const xAxis = options.xAxis.map(it => {
    //         return {
    //           ...it,
    //           axisLine: {
    //             ...it.axisLine,
    //             lineStyle: {
    //               color: border,
    //               type: 'solid',
    //               width: 1
    //             }
    //           }
    //         }
    //       })
    //       optionObj.xAxis = xAxis
    //     }
    //     if (options.yAxis) {
    //       const yAxis = options.yAxis.map(it => {
    //         return {
    //           ...it,
    //           axisLine: {
    //             ...it.axisLine,
    //             lineStyle: {
    //               color: border,
    //               type: 'solid',
    //               width: 1
    //             }
    //           },
    //           splitLine: {
    //             lineStyle: {
    //               ...it.splitLine.lineStyle,
    //               color: border,
    //             }
    //           }
    //         }
    //       })
    //       optionObj.yAxis = yAxis
    //     }
    //     if (options.dataZoom) {
    //       const dataZoom = options.dataZoom.map(it => {
    //         return {
    //           ...it,
    //           borderColor: border
    //         }
    //       })
    //       optionObj.dataZoom = dataZoom
    //     }
    //     this.echarts.setOption(optionObj)
    //   }
    // });
  },

  beforeDestroy () {
    this.clean()
  },

  _numerify: numerify
}
