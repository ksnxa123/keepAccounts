<template>
  <Layout>
    <Tabs :data-source="recordTypeList" :value.sync="type" slot="header"></Tabs>
    <div class="chart-wrapper" ref="chartWrapper">
      <Chart class="chart" :options="chartOptions" />
    </div>
    <div class="chart-wrapper" ref="chartWrapper">
      <Chart class="chart" :options="pieWrapper" />
    </div>
    <ol v-if="groupedList.length>0">
      <li v-for="(group, index) in groupedList" :key="index">
        <h3 class="title">{{beautify(group.title)}} <span>￥{{group.total}}</span></h3>
        <ol>
          <li v-for="item in group.items" :key="item.id" class="record" @click="change_li(item.createdAt)">
            <span>{{tagString(item.tags)}}</span>
            <span class="note">{{item.notes}}</span>
            <span :class="item.type=='-'? 'money1':'money2'">￥{{item.amount}} </span>
            <span v-show="item.createdAt === currentIndex" @click="deli(item.createdAt)">
              <Icon name='del'></Icon>
            </span>
          </li>
        </ol>
      </li>
    </ol>
    <div v-else class="noResult">
      目前没有相关信息~
    </div>
  </Layout>
</template>
<script lang="ts">
  import Vue from 'vue';
  import {Component} from 'vue-property-decorator';
  import Tabs from '@/components/Tabs.vue';
  import recordTypeList from '@/constants/recordTypeList';
  import dayjs from 'dayjs';
  import clone from '@/lib/clone';
  import Chart from '@/components/Chart.vue';
  import day from 'dayjs';
  import store from '@/store';

  var _ = require('lodash');

  @Component({
    components: {Tabs,Chart},
  })
  export default class Statistics extends Vue {
    tagString(tags: Tag[]) {
      return tags.length === 0 ? '无' : tags[0].name;
    }
    currentIndex = '';

    created(){
      this.$store.commit('fetchRecords');
      this.getPieData()
    }

    mounted() {
      const div = (this.$refs.chartWrapper as HTMLDivElement);
      div.scrollLeft = div.scrollWidth;
    }

    beautify(string: string) {
      const day = dayjs(string);
      const now = dayjs();
      if (day.isSame(now, 'day')) {
        return '今天';
      } else if (day.isSame(now.subtract(1, 'day'), 'day')) {
        return '昨天';
      } else if (day.isSame(now.subtract(2, 'day'), 'day')) {
        return '前天';
      } else if (day.isSame(now, 'year')) {
        return day.format('M月D日');
      } else {
        return day.format('YYYY年M月D日');
      }
    }

    get keyValueList() {
      const today = new Date();
      var m = today.getMonth() + 1 < 10 ? '0' + (today.getMonth() + 1) : today.getMonth() + 1;
      var d = today.getDate();
      const array = [];
      for (let i = 0; i <= 29; i++) {
        var dateString = day(today).subtract(i, 'day').format('YYYY-MM-DD');
        const found = _.find(this.groupedList, {
          title: dateString
        });
        array.push({
          key: dateString, value: found ? found.total : 0
        });
      }
      array.sort((a, b) => {
        if (a.key > b.key) {
          return 1;
        } else if (a.key === b.key) {
          return 0;
        } else {
          return -1;
        }
      });
      return array.slice(30-d);
    }

    get chartOptions() {
      const keys = this.keyValueList.map(item => item.key);
      const values = this.keyValueList.map(item => item.value);
      return {
        title:{
          text:this.getText() +'趋势',
          left:'3%',
          top:"5%",
          textStyle:{
            fontSize:16,
            fontStyle:'normal',
            color:'#FF8000'
          }
        },
        grid: {
          left: '15%',
          right: '5%',
          bottom:'10%'
        },
        xAxis: {
          type: 'category',
          data: keys,
          axisTick: {alignWithLabel: true,show:false},
          axisLine: {lineStyle: {color: '#666'}},
          axisLabel: {
            formatter: function (value: string, index: number) {
              return value.substr(5);
            },
            interval:4,
            rotate:30
          }
        },
        yAxis: {
          type: 'value',
          show: true,
          axisLabel:{
            formatter:function(value:number){
              return '￥'+value
            }
          }
        },
        series: [{
          symbol: (values:any)=>values==0?'none':'circle',
          showAllSymbol:true,
          symbolSize: 12,
          // 拐点样式
          itemStyle: {
            normal:{//静止时
              color:'#3aa7ff',
            },
            emphasis:{//鼠标经过
              color:'#2E2EFE',
              borderColor:'#2E2EFE',
            }
          },              
          data:values,
          connectNulls:true,
          type: 'line',
          lineStyle:{
            color:'#0040FF'
          }
        }],
        tooltip: {
          show: true, 
          triggerOn: 'click',
          position: 'top',
          formatter: '{c}'
        }
      };
    }

    get pieWrapper(){
      return{
            title: {
                text: '分类'+this.getText()+'占比',
                left: '3%',
                top:"5%",
                textStyle:{
                  fontSize:16,
                  fontStyle:'normal',
                  color:'#FF8000'
                }
            },
            tooltip: {
                trigger: 'item',
                formatter:'{b}:￥{c}'
            },
            legend: {
                orient: 'horizontal',
                bottom: 'bottom',
            },
            series:[
              {
                  type: 'pie',
                  radius: '50%',
                  data:this.getPieData(),
                  label:{
                    normal:{
                      show:true,
                      formatter:'{b}\n{d}%'
                    }
                  },
                  emphasis: {
                      itemStyle: {
                          shadowBlur: 10,
                          shadowOffsetX: 0,
                          shadowColor: 'rgba(0, 0, 0, 0.5)'
                      }
                  }
              }
            ]
      }
    }
    get recordList() {
      return (this.$store.state as RootState).recordList;
    }

    get groupedList() {
      const {recordList} = this;
      if (recordList.length === 0) {return [];}

      const newList = clone(recordList)
        .filter(r => r.type === this.type)
        .sort((a, b) => dayjs(b.createdAt).valueOf() - dayjs(a.createdAt).valueOf());
      if(newList.length === 0){return [] as Result}
      type Result = { title: string, total?: number, items: RecordItem[] }[]
      const result: Result = [{title: dayjs(newList[0].createdAt).format('YYYY-MM-DD'), items: [newList[0]]}];
      for (let i = 1; i < newList.length; i++) {
        const current = newList[i];
        const last = result[result.length - 1];
        if (dayjs(last.title).isSame(dayjs(current.createdAt), 'day')) {
          last.items.push(current);
        } else {
          result.push({title: dayjs(current.createdAt).format('YYYY-MM-DD'), items: [current]});
        }
      }
      result.map(group => {
        group.total = group.items.reduce((sum, item) => {
          return sum + Number(item.amount);
        }, 0);
      });
      return result;
    }

    // '-'删除图标的显示隐藏
    change_li(index: any){
      if(this.currentIndex === index){
        this.currentIndex = '';
      }else{
        this.currentIndex = index; 
      }
    }

    // 删除一条账单
    deli(createdAt:any){
      // this.currentIndex = '';
      if(this.recordList){
        this.$store.commit('removeRecord',createdAt);
      }
    }

    // 获取折线图名字
    getText(){
      if(this.type==='-'){
        return this.recordTypeList[0].text
      }else{
        return this.recordTypeList[1].text
      }
    }

    // 获取pie图的数据
    getPieData(){
      const arr: {}[]=[];
      let map ={};
      let arr1 = [];
      const value = this.groupedList.map(item=>item.items)
      const value1 = value.flat(1).map(item=>item.tags).flat(1)
      const money = value.flat(1).map(item=>item.amount)
      const value2 = value1.map(item=>item.hasOwnProperty('title') ? item['title']: '其它')
      let size = money.length;
      for(let i = 0;i<size;i++){
        let a={};
        a['amount'] = money[i];
        a['title'] = value2[i];
        arr.push(a);
      }
      for(let i = 0;i<arr.length;i++){
        if(!map[arr[i]['title']]){
          arr1.push(arr[i]);
          map[arr[i]['title']] = true;
        }else{
          for(let j = 0;j<arr1.length;j++){
            if(arr[i]['title']===arr1[j]['title']){
              arr1[j]['amount'] = (Number(arr1[j]['amount'])+Number(arr[i]['amount'])).toString();
            }
          }
        }
      }
      const result1 = JSON.parse(JSON.stringify(arr1).replace(/title/g, 'name'))  //data为数组，title为修改前，name为修改后
      const result2 = JSON.parse(JSON.stringify(result1).replace(/amount/g, 'value'))    //data为数组，title为修改前，name为修改后
      return result2;
    }
    type = '-';
    recordTypeList = recordTypeList;
  }
</script>

<style scoped lang="scss">
  .chart-wrapper{
    border: 10px solid rgba(25, 186, 139, 0.17);
  }
  .noResult{
   padding: 16px;
   text-align: center; 
  }
  ::v-deep {
    .type-tabs-item {
      background: #C4C4C4;
      &.selected {
        background: white;
        &::after {
          display: none;
        }
      }
    }
    .interval-tabs-item {
      height: 48px;
    }
  }
  %item {
    padding: 8px 16px;
    line-height: 24px;
    display: flex;
    justify-content: space-between;
    align-content: center;
  }
  .title {
    @extend %item;
    background:  #E5E5E5;
  }
  .money1{
    color: salmon;
  }
  .money2{
    color: seagreen;
  }
  .record {
    background: white;
    @extend %item;
  }
  .note {
    margin-right: auto;
    margin-left: 16px;
    color: #999;
  }
</style>

