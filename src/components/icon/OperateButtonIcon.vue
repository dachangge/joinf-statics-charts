<template>
  <div class="operate_button_vue">
    <icon class="icon" @className="className" :type="type" :size="size" :color="color"></icon>
  </div>
</template>

<script>
  // 图标按钮
  export default {
    name: 'OperateButton',
    props: {
      type: {
        type: String,
        required: true
      },
      color: {
        type: String,
        default: '#5c6b77'
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
  }
</script>

<style scoped lang="scss">
  .operate_button_vue{
    display: inline-block;
    width: 28px;
    height: 28px;
    line-height: 28px;
    text-align: center;
    outline: medium;
    -webkit-border-radius: 50%;
    -moz-border-radius: 50%;
    border-radius: 50%;
    font-size: 0;
    &:hover{
      background-color: $background-color-base9;
    }
  }
</style>
