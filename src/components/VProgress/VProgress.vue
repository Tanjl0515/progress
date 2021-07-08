<!--
     Describe: 实现带遮罩的进度条组件
     Created by King
     使用说明：
     1. 引入组件，请为组件配置ref
     2. 使用this.$progress.instance.start() 方法开启进度条。
     3. 不同场景可配置text_string_obj 字串
     4. 如特殊场景可配置引用组件时配置progress_obj，外部控制组件的状态。
 -->
<template>
  <div
    v-show="c_show"
    class="c-progress"
  >
    <div class="progress-modal" />
    <el-progress
      :text-inside="true"
      :stroke-width="26"
      :percentage="c_percent_current"
    />
    <!-- TMO 项目中，进度条暂未有使用文字提示 -->
    <!-- <div class="progress-text">
      {{ c_text }}
    </div> -->
  </div>
</template>
<script>
export default {
  props: {
    progressObj: {
      type: Object,
      default: function () {
        return { // 外部引用待初始化数据
          percent: 0, // 进度百分比
          text: "Please wait..." // 进度条下方显示的状态文本
        };
      }
    }
  },
  data() {
    return { // 组件本地数据
      c_percent: 0, // 进度百分比
      c_percent_current: 0, // 当前显示进度百分比
      c_text: "", // 进度条下方显示的状态文本
      c_show: false, // 控制本组件显示或隐藏
      timer: null, // 定时器实例
      delay_task: null, // 延迟执行任务
      loop_task: null, // 延迟执行后的 loo 任务
      time_diff_task: null,
      // text_string_obj: {
      //   wifi_reset: [this.$t("info_msg.tx_progress_1"),"",this.$t("info_msg.tx_progress_2")], // [0]开始状态 [1]中间状态（无该流程可填空字串） [2] 结束状态
      //   device_reboot: [this.$t("info_msg.tx_progress_1"),"",this.$t("info_msg.tx_progress_3")], // [0]开始状态 [1]中间状态（无该流程可填空字串） [2] 结束状态
      //   file_upload: [this.$t("info_msg.tx_uploading"),"",this.$t("info_msg.tx_uploading")]
      // },
      is_custom_close: false, // 是否为自定义关闭
      text_string_type: "wifi_reset" //保存进度条字串显示类型
    };
  },
  watch: {
    // 监听动态传入数据，可用于外部控制组件数据
    progressObj: {
      handler(new_val) {
        // 仅在 进度为 1~99时，显示进度条
        if (0 < new_val.percent && new_val.percent < 100){
          // 显示组件
          this.c_show = true;
        } else if (new_val.percent === 0){ // 用户在上传文件之前，重置进度条为零
          this.c_show = false;
        } else {
          // 延迟2s隐藏组件,保持最终状态字串提示，提醒用户。
          setTimeout(() => {
            this.c_show = false;
          },2000);
        }
        // 检测到外部传值改变，更新百分比和文本
        this.c_percent = new_val.percent;
        // 如果外部不传值，则取当前loading显示字串数组的尾值(完成进度显示的值)。
        // this.c_text = new_val.text ? new_val.text : this.text_string_obj[this.text_string_type][2];
      },
      deep: true
    },
    c_percent_current(new_val) {
      if (0 < new_val && new_val < 100){
        // 显示组件
        this.c_show = true;
      } else {
        // 非自定义关闭的状态下，才自动关闭进度条
        if (!this.is_custom_close){
          // 延迟2s隐藏组件,保持最终状态字串提示，提醒用户。
          setTimeout(() => {
            this.c_show = false;
          },2000);
        }
      }
    }

  },
  created(){
    // 初始化组件时，仅在进度为 1~99时，显示本组件
    if (0 < this.percent && this.percent < 100){
      // 显示组件
      this.c_show = true;
    } else {
      // 隐藏组件
      this.c_show = false;
    }
  },
  destroyed(){
    // 定时器任务集合
    let setIntervalArr = [this.timer, this.loop_task];
    // 关闭定时任务
    this.priClearInterval(setIntervalArr);
  },
  methods: {
    // 手动开启进度条
    // params[0]: compelte_time 可传入完成100%进度所需时间
    // params[1]: type 请对应this.text_string_obj中的字串。text_string_obj可自行配置
    // start(compelte_time = 100,type = "wifi_reset",is_custom_close = false,cb){

    /**
     * 启动进度条
     *
     * @param options - 进度条配置参数
     * @param   options.estimate_time - 进度条总预估时间（毫秒）
     * @param   options.delay - 第一次请求的延迟时间（毫秒）
     * @param   options.interval - 轮询时间间隔（毫秒）
     * @param callback - 进度条走完后的回调处理，比如进度条走完刷新页面
     */
    start(options, callback){
      // 每次start，都要初始化进度条进度，防止二次上传时watch不到progress_obj.percent的变动
      this.progressObj.percent = 0;
      // 初始化百分比
      this.c_percent = 1;
      // 每次start，都要复位进度提示txt
      // this.c_text = this.text_string_obj[this.text_string_type][0];
      // is_custom_close = true的情况下， 需要自行手动
      // 修改是否自定义关闭进度条的标志
      this.is_custom_close = options.is_custom_close ? options.is_custom_close : false;
      // 保存进度条字串显示类型
      this.text_string_type = options.type ? options.type : "wifi_reset";
      // 开始倒计时
      this.timer = setInterval(() => {
        // 累加百分比,百分比不能大于100
        this.c_percent = ((this.c_percent + ( 100 / options.estimate_time)) > 100) ? 100 : (this.c_percent + ( 100 / options.estimate_time));
        // 页面需要显示的进度;  < 1 时为 1 时为了在上传大文件时快速启动显示进度条
        this.c_percent_current = parseInt(this.c_percent) < 1 ? 1 : parseInt(this.c_percent);

        /* Object.keys(this.text_string_obj).forEach((key) => {
          if (key === options.type ? options.type : "wifi_reset"){
            // 文字状态显示分为三种状态字串显示，请配置this.text_string_obj
            // percents < 30  显示第一种提示语
            if (this.c_percent < 30){
              this.c_text = this.text_string_obj[key][0];
            } else if (this.c_percent <= 99){
              // percents <= 99  显示第二种提示语
              this.c_text = (this.text_string_obj[key][1] !== "") ? this.text_string_obj[key][1] : this.text_string_obj[key][0];
            } else {
              //  显示结束提示语(停留三秒后关闭)
              this.c_text = this.text_string_obj[key][2];
            }

          }
        }); */

        // 达到100%清除定时器
        if (this.c_percent >= 100){
          // 定时器任务集合
          let setIntervalArr = [this.timer, this.loop_task];
          // 关闭定时任务
          this.priClearInterval(setIntervalArr);
          // 执行回调
          (typeof callback === "function") && callback();
        }
      }, 1000);
    },
    // 强制关闭进度条
    close(){
      // 定时器任务集合
      let setIntervalArr = [this.timer, this.loop_task];
      // 关闭定时任务
      this.priClearInterval(setIntervalArr);
      // 隐藏组件
      this.c_show = false;
    },
    // 进度条未走完，提前关闭进度条
    progressToEnd () {
      // 设置进度条未 100%
      this.c_percent = 100;
      // 延迟 1s 是表现出一个快速走完进度条的过程
      setTimeout(() => {
        // 关闭进度条，清除定时任务
        this.close();
      }, 1000);
    },

    /**
     * [progressTask description]
     *
     * @param options - 进度条配置参数
     * @param   options.estimate_time - 进度条总预估时间（毫秒）
     * @param   options.delay - 第一次请求的延迟时间（毫秒）
     * @param   options.interval - 轮询时间间隔（毫秒）
     * @param loopHandler - 轮询任务
     */
    progressTask(options, loopHandler) {
      // 启用进度条
      this.start(options);
      // 判断第一次请求是否要延迟执行
      if (options.delay) {
        // 如果要延迟执行，进行以下处理
        // 判断延迟时间是否大于进度条总预估时间
        if (options.delay > options.estimate_time) {
          // 输出错误log并返回
          window.$global.log("The delay time is bigger than the estimate time.");
          return;
        }
        // 定义一个延迟请求的任务, 在设置的延迟时间后执行 loopHandler
        this.delay_task = setTimeout(() => {
          // 立即执行 loopHandler 程序
          loopHandler();
          // 延迟执行后的 loop 任务
          this.loop_task = setInterval(() => {
            // 直接执行 loopHandler 任务
            loopHandler();
          }, options.interval);
        }, options.delay);
      } else {
        // 直接执行 loopHandler 任务
        loopHandler();
        // 设置轮循任务
        this.loop_task = setInterval(() => {
          // 直接执行 loopHandler 任务
          loopHandler();
        }, options.interval);
      }
    },

    /**
     * 关闭定时任务
     *
     * @param arr - 需要关闭的定时器任务集合
     */
    priClearInterval (arr) {
      // 遍历定时器任务
      for (let i = 0; i < arr.length; i++) {
        // 如果定时器任务存在
        if (arr[i] !== null) {
          // 清除掉定时任务
          clearInterval(arr[i]);
        }
      }
    }
  }
};
</script>
<style lang="less" scoped>
    .c-progress {
        position: fixed;
        top: 45%;
        left: 15%;
        height: 26px;
        width: 70%;
        z-index: 9999;

        .progress-modal {
            position: fixed;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            opacity: .8;
            background-color: hsla(0,0%,100%,.9);
            transition: opacity .3s;
            z-index:2010
        }
        .el-progress {
            z-index: 2011;
        }
        .progress-text {
            z-index: 2011;
            color: #e1231b;
            position: fixed;
            left: 40%;
            font-weight: bold;
        }
        @media only screen and (max-width: 767px) {

            .progress-text {
                left: 20%;
            }
        }
    }

</style>