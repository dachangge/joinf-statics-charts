<template>
  <div id="app">
    <customerDistributionChart :params="{}" :showDatePicker="true" />
  </div>
</template>

<script>
import customerDistributionChart from '@/components/charts/customerDistributionChart.vue'
export default {
  name: 'App',
  components: {
    customerDistributionChart
  }
}
</script>

<style>

</style>
