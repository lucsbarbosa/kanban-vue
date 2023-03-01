import Vue from 'vue';
import App from './App.vue';
import { BootstrapVue } from 'bootstrap-vue';
import Toast from "vue-toastification";
import axios from 'axios';
import VueAxios from 'vue-axios';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-vue/dist/bootstrap-vue.css';
import "vue-toastification/dist/index.css";

Vue.use(BootstrapVue);
Vue.use(VueAxios, axios)
Vue.use(Toast, {
  transition: "Vue-Toastification__fade",
  maxToasts: 20,
  newestOnTop: true
});

Vue.config.productionTip = false;

new Vue({
  render: h => h(App),
}).$mount('#app');
