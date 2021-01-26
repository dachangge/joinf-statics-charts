// import { Button } from 'element-ui'
export default {
  name: 'chartDimension',
  render(h) {
    const btns = this.dataArray.map((info) => {
      return h('el-button', {
        class: ['chart-dimension-button'],
        props: {
          type: this.value === info.value ? 'primary' : 'default',
          plain: true
        },
        on: {
          click: () => this.clickHandler(info)
        }
      }, [
        h('span', this.langs[info.lang] || info.text)
      ])
    })
    return h('div', {
      class: ['chart-dimension'],
    }, [...btns, this.$slots.default])
  },
  model: {
    prop: 'value',
    event: 'change'
  },
  computed: {
    langs() {
      return this.$tt('base', 'chartDimension');
    },
    dataArray() {
      return this.data
    }
  },
  props: {
    value: {
    },
    data: {
      type: Array,
      default: () => []
    },
  },
  methods: {
    clickHandler(info) {
      this.$emit('change', info.value)
    }
  },
  watch: {
  }
}
