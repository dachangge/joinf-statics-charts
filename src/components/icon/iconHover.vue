<template>
    <span @mouseenter="mouseEnter" @mouseleave="mouseLeave" @mousedown="mouseDown" @mouseup="mouseEnter">
        <icon class="icon pointer" @className="className" :type="type" :size="size" :color="iconColor"></icon>
    </span>
</template>

<script>
  import Icon from './icon.vue'

  export default {
    name: 'iconHover',
    components: { Icon },
    props: {
      type: {
        type: String,
        required: true
      },
      /**
       * 颜色
       * {color: 显示颜色, hover: 滑过颜色, active: 按下颜色}
       */
      color: {
        type: Object,
        required: true,
        default: () => {
        }
      },
      size: {
        type: Number,
        default: 14
      },
      className: {
        type: String,
        default: ''
      }
    },
    data() {
      return {
        // 图标显示的颜色
        iconColor: this.color.color
      }
    },
    methods: {
      mouseEnter() {
        if (this.color.hover) {
          this.iconColor = this.color.hover;
        }
      },
      mouseLeave() {
        if (this.color.color) {
          this.iconColor = this.color.color;
        }
      },
      mouseDown() {
        if (this.color.active) {
          this.iconColor = this.color.active;
        }
      }
    }
  }
</script>

<style scoped>

</style>
