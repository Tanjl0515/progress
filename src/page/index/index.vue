<template>
  <div>
    Home
  </div>
</template>

<script>
export default {
  data() {
    return {

    }
  },
  created() {
    this.initPage();
    this.closeProgress();
  },
  methods: {
    initPage() {
      setTimeout(() => {
        // 启动进度条
        this.$progress.instance.start({
          estimate_time: 60,
          interval: 5000,
          delay: 26000
        });
      }, 2000);
    },

    closeProgress() {
      setTimeout(() => {
        // 提前关闭进度条
        this.$progress.instance.progressToEnd();
      }, 10000)
    }
  }
}
</script>

<style>

</style>