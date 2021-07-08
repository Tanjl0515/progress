import VProgress from "@/components/VProgress/VProgress.vue";

const v_progress = {
  install: (Vue) => {
    // 创建一个Vue的“子类”组件
    const VProgressAlertConstructor = Vue.extend(VProgress);
    // 创建一个该子类的实例,并挂载到一个元素上
    const instance = new VProgressAlertConstructor();
    // 将这个实例挂载到动态创建的元素上,并将元素添加到全局结构中
    instance.$mount(document.createElement("div"));
    document.body.appendChild(instance.$el);

    Vue.prototype.$progress = {
      instance
    };
  }
};

export default v_progress;