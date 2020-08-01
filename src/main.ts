import Vue from "vue";
import App from "./App.vue";
import "./registerServiceWorker";
// import router from "./router";
import VueCompositionApi from "@vue/composition-api";
import vuetify from "@/plugins/vuetify";
import VueRx from "vue-rx";

Vue.use(VueCompositionApi);
Vue.use(VueRx);

Vue.config.productionTip = false;

new Vue({
  // router,
  render: (h) => h(App),
  vuetify,
}).$mount("#app");
