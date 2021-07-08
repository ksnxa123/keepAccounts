import Vue from 'vue'
import App from './App.vue'
import './registerServiceWorker'
import router from './router'
import store from './store'
import Nav from './components/Nav.vue'
import Layout from './components/Layout.vue'
import Icon from '@/components/Icon.vue';

import {Notify,DatetimePicker,Popup,Cell} from 'vant';
Vue.use(Notify).use(DatetimePicker).use(Popup).use(Cell);

import dayjs from 'dayjs'
import isBetween from 'dayjs/plugin/isBetween'
dayjs.extend(isBetween)
dayjs.locale('zh-cn')

Vue.config.productionTip = false

// 全局组件
Vue.component('Nav',Nav)
Vue.component('Layout',Layout)
Vue.component('Icon', Icon);

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
