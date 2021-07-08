<template>
  <Layout>
    <div slot="header" class="header">
      <div>
        <!-- <div>
          <select class="year" v-model="sList[0]">
            <option v-for="item in year" :key='item.name' :value="item.value">{{item.name}}</option>
          </select>
          <span>年</span>
        </div>
        <div>
          <select class="month" v-model="sList[1]">
            <option v-for="item in month" :key="item.name" :value="item.value">{{item.name}}</option>
          </select>
          <span>月</span>
        </div> -->
          <div @click="showPopup">
            <span class="year">{{date.substring(0,4)}}</span>
            <span>年</span>
          </div>
          <div @click="showPopup">
            <span class="month">{{date.substring(5)}}</span>
            <span>月</span>
          </div>
      </div>
      <div>
        <span>收入<span class="num">{{this.moneyDetail[1]}}</span></span>
        <span>支出<span class="num">{{this.moneyDetail[0]}}</span></span>
      </div>
    </div>
    <ol v-if="recordList.length>0&&this.groupedList.length>0" >
        <li v-for="item1 in groupedList" :key='item1.createdAt'>
          <h3 class="title">{{beautify(item1.title)}} <div><span>支{{item1.total}}</span> <span>收{{item1.total1}}</span></div></h3>
          <ol>
            <li v-for="item in item1.items" :key="item.id" class="record" @click="change_li(item.createdAt)">
              <span><Icon :name='tagString(item.tags)'></Icon></span>
              <span class="note">{{item.notes}}</span>
              <span :class="item.type=='-'? 'money1':'money2'">{{item.type=='-'?-item.amount:item.amount}} </span>
              <span v-show="item.createdAt === currentIndex" @click="deli(item.createdAt)">
                <Icon name='del'></Icon>
              </span>
            </li>
          </ol>
        </li>
    </ol>
    <div v-else class="noResult">
        <Icon name='note'></Icon>
        <span>暂无数据</span>
    </div>
    <Nav slot="footer"></Nav>
    <van-popup v-model="show" 
        safe-area-inset-bottom 
        :overlay="true"
        position="bottom" :style="{height:'40%'}">
          <van-datetime-picker
            v-model="currentDate"
            toolbar-position='top'
            type="year-month"
            :min-date="minDate"
            :max-date="maxDate"
            @cancel='cancelFn'
            @confirm = saveTime
            @change="endTime"
          />
    </van-popup>
  </Layout>
</template>
<script lang="ts">
  import Vue from 'vue';
  import {Component, Watch} from 'vue-property-decorator';
  import Tabs from '@/components/Tabs.vue';
  import recordTypeList from '@/constants/recordTypeList';
  import dayjs from 'dayjs';
  import clone from '@/lib/clone';
  import day from 'dayjs';

  var _ = require('lodash');

  @Component({
    components: {Tabs},
  })
  export default class Statistics extends Vue {
    tagString(tags: Tag[]) {
      return tags.length === 0 ? 'noselected' : tags[0].type+'-actived';
    }
    currentIndex = '';
    sList =['0','0'];
    year = [
      {name:"2017",value:"2017"},
      {name:"2018",value:"2018"},
      {name:"2019",value:"2019"},
      {name:"2020",value:"2020"},
      {name:"2021",value:"2021"}
    ]
    month =[
      {name:"01",value:"01"},
      {name:"02",value:"02"},
      {name:"03",value:"03"},
      {name:"04",value:"04"},
      {name:"05",value:"05"},
      {name:"06",value:"06"},
      {name:"07",value:"07"},
      {name:"08",value:"08"},
      {name:"09",value:"09"},
      {name:"10",value:"10"},
      {name:"11",value:"11"},
      {name:"12",value:"12"},
    ]

    show = false;
    sdate =''
    date = dayjs().format('YYYY-MM')
    showPopup(){
      this.show = true
    }
    minDate = new Date(2020, 0, 1);
    maxDate = new Date(2025, 10, 1);
    currentDate = new Date(Number(dayjs().format('YYYY')), Number(dayjs().subtract(1,'month').format('MM')));
    cancelFn(){
      this.show = false
    }
    saveTime(e: any){
      this.show = false
      this.date = this.sdate[0]+'-'+this.sdate[1]
    }
    endTime(e: any){
      this.sdate = e.getValues();
    }

    created(){
      this.$store.commit('fetchRecords');
      this.getOption();
      this.moneyDetail;
      this.getday();
    }
    updated(){
      console.log(this.date);
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

    get groupedList() {
      const {recordList} = this;
      const arr: { title: string; total?: number|undefined; items: RecordItem[]; total1?: number|undefined; }[] =[]
      if (recordList.length === 0) {return [];}
      
      const newList = clone(recordList)
        .sort((a, b) => dayjs(b.createdAt).valueOf() - dayjs(a.createdAt).valueOf());
      
      if(newList.length === 0){return [] as Result}
      type Result = { title: string, total?: number, items: RecordItem[],total1?:number }[]
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
        const arr1: number[]=[];
        const arr2:number[]=[];
        group.items.map(item=>{
          if(item.type==='-'){
            arr1.push(item.amount)
          }else{
            arr2.push(item.amount)
          }
        })
        group.total = arr1.reduce((sum,item)=>{
          return sum+Number(item)
        },0)
        group.total1 = arr2.reduce((sum,item)=>{
          return sum+Number(item)
        },0)
      });
      result.map(item=>{
        if(item.title.substring(0,7)==this.date){
          arr.push(item)
        }
      })
      return arr;
    }

    get recordList() {
      return (this.$store.state as RootState).recordList;
    }

    // 当月总
    get moneyDetail(){
      let arr1:any[] =[];
      let arr2:any[] =[];
      if(this.groupedList.length!=0){
       (arr1 as any) = this.groupedList.map(item => item.total).reduce((pre,cur) => (pre as any)+cur);
       (arr2 as any) = this.groupedList.map(item => item.total1).reduce((pre,cur) => (pre as any)+cur);
      }else{
        (arr1 as any) = 0;
        (arr2 as any) = 0;
      }
      return [arr1,arr2]
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

    // 动态设置select默认值
    getOption(){
      const today = new Date();
      var m = today.getMonth() + 1 < 10 ? '0' + (today.getMonth() + 1) : today.getMonth() + 1;
      var y = today.getFullYear();
      this.year.map(item => {if(Number(item.value) == y){this.sList.splice(0,1,item.value)}})
      this.month.map(item => {if(Number(item.value) == m){this.sList.splice(1,1,item.value)}})
    }

    getday(){
      const today = new Date();
      const time = day(today).format('YYYY-MM');
      return time
    }

    type = '-';
    recordTypeList = recordTypeList;
  }
  
</script>

<style scoped lang="scss">
    .noResult{
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100%;
        >.icon{
            width: 80px;
            height: 100px;
        }
        >span{
            font-size: 20px;
            color: rgba($color: #c5b7b7, $alpha: 1.0);
        }
    }
    .header{
        background: #1296db;
        display: flex;
        justify-content: center;
        align-items: center;
        >:nth-child(1){
          flex: 1;
          >div{
            padding: 5px 0 0 20px;

            >span{
              font-size: 12px;
            }
            >.year{
              padding: 10px 3px;
            }
            >.month{
              padding: 10px 3px;
              font-size: 20px;
            }
          }
        }
        >:nth-child(2){
          flex: 3;
          display: flex;
          >span{
            flex: 1;
            color: #fff;
            padding-left: 10px;
          }
          .num{
            padding-left: 10px;
          }
        }
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
  .year,.month{
    /*去除select边框*/
    border: 0;
    background: transparent; 
    /*去除下拉框的三角下标*/
    appearance:none;
    -moz-appearance:none; /* Firefox */
    -webkit-appearance:none; /* Safari 和 Chrome */
    color: rgb(43, 46, 43);
  }
</style>

