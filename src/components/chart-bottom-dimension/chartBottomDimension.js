// import { Button } from 'element-ui'
export default {
  name: 'chartBottomDimension',
  render(h) {
    const children = this.data.map((info) => {
      return h('li', {
        class: this.value === info.value ? 'active' : '',
        on: {
          click: () => this.clickHandler(info)
        }
      }, info.lang ? info.lang[this.$i18n.locale] : '')
    })
    return h('ul', {
      class: ['chart-bottom-dimension'],
    }, [...children, this.$slots.default])
  },
  model: {
    prop: 'value',
    event: 'change'
  },
  computed: {
    langs() {
      return this.$tt('base', 'chartDimension');
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
