import Vue from 'vue'
import VueRouter, { RouteConfig } from 'vue-router'
import Money from '../views/Money.vue';
import Label from '../views/Label.vue';
import Statistics from '../views/Statistics.vue'
import NotFound from '../views/NotFound.vue'
import List from '@/views/List.vue';

Vue.use(VueRouter)

const routes: Array<RouteConfig> = [
  {
    path:'/',
    redirect:'/money'
  },{
    path: '/money',
    component: Money
  },{
    path:'/label',
    component:Label
  },{
    path:'/statistics',
    component:Statistics
  },{
    path:'/list',
    component:List
  },{
    path:'*',
    component:NotFound
  }
]

const router = new VueRouter({
  routes
})

export default router
