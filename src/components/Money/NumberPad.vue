<template>
  <div class="numberPad">
    <div class="output">{{output}}</div>
    <div class="buttons">
      <button @click="inputContent">1</button>
      <button @click="inputContent">2</button>
      <button @click="inputContent">3</button>
      <div class="date" readonly @click="showPopup">
        <Icon name='date'></Icon>
        <span>{{date}}</span>
      </div>
      <button @click="inputContent">4</button>
      <button @click="inputContent">5</button>
      <button @click="inputContent">6</button>
      <button @click="remove">删除</button>
      <button @click="inputContent">7</button>
      <button @click="inputContent">8</button>
      <button @click="inputContent">9</button>
      <button @click="clear">清空</button>
      <button @click="inputContent" class="zero">0</button>
      <button @click="inputContent">.</button>
      <button @click="ok">OK</button>
    </div>
    <van-popup v-model="show" 
        safe-area-inset-bottom 
        :overlay="true"
        position="bottom" :style="{height:'30%'}">
          <van-datetime-picker
            v-model="currentDate"
            toolbar-position='top'
            type="date"
            title=""
            :min-date="minDate"
            :max-date="maxDate"
            @cancel='cancelFn'
            @confirm = saveTime
            @change="endTime"
          />
    </van-popup>
  </div>
</template>

<script lang="ts">
  import Vue from 'vue';
  import {Component, Prop} from 'vue-property-decorator';
  import dayjs from 'dayjs';
  import { Notify } from "vant";

  @Component
  export default class numberPad extends Vue{
    @Prop() readonly value!:number;
    output = this.value.toString();

    show = false;
    sdate =''
    date = dayjs().isSame(dayjs(), 'day') ? '今天' : dayjs().format('YYYY-MM-DD')
    showPopup(){
      this.show = true
    }
    minDate = new Date(2020, 0, 1);
    maxDate = new Date(2025, 10, 1);
    currentDate = new Date(2021, 0, 17);
    cancelFn(){
      this.show = false
    }
    saveTime(e: any){
      this.show = false
      this.date = this.sdate[0]!==undefined ? this.sdate[0]+'-'+this.sdate[1]+'-'+this.sdate[2] : this.date
    }
    endTime(e: any){
      this.sdate = e.getValues();
    }


    inputContent(event:MouseEvent){
      const button = (event.target as HTMLButtonElement);//强制告诉target是个按钮
      const input = button.textContent!;//！不为空
      if(this.output.length === 16){return;}
      if(this.output === '0'){
        if('0123456789'.indexOf(input) >= 0){
          this.output = input;
        }else{
          this.output += input;
        }
        return;
      }
      if(this.output.indexOf('.') >= 0 && input === '.'){return;}
      this.output += input;
    }

    remove(){
      if(this.output.length ===1){
        this.output = '0';
      }else{
        this.output = this.output.slice(0,-1);
      }
    }

    clear(){
      this.output = '0'
    }

    ok(){
      var date2 = this.date == '今天'?dayjs().format('YYYY-MM-DD'):this.date
      if(this.output == '0'){
        Notify({ type: 'warning', message: '赶紧记一笔吧！',
            duration:1000,});
      }else{
        this.$emit('update:value',this.output,date2);
        this.$emit('submit',this.output,date2);
      }
      this.output = '0';
      this.date = dayjs().isSame(dayjs(), 'day') ? '今天' : dayjs().format('YYYY-MM-DD');
    }

  }
</script>

<style lang="scss" scoped>
  @import "~@/assets/style/helper.scss";
  .output {
    @extend %clearFix;
    @extend %innerShadow;
    font-size: 20px;
    font-family: Consolas, monospace;
    padding: 9px 16px;
    text-align: right;
    background:#f5f5f5;
  }
  .buttons{
      @extend %clearFix;
      >.date {
        float: right;
        height: 64px;
        width: 25%;
      }
      >button{
        width: 25%;
        height: 64px;
        background: transparent;
        border:none;
        &.zero {
          width: 25*2%;
        }
        $bg: #f2f2f2;
        &:nth-child(1) {
          background: $bg;
        }
        &:nth-child(2), &:nth-child(5) {
          background: darken($bg, 4%);
        }
        &:nth-child(3), &:nth-child(6), &:nth-child(9) {
          background: darken($bg, 4*2%);
        }
        &:nth-child(7), &:nth-child(10),&:nth-child(13) {
          background: darken($bg, 4*3%);
        }
        &:nth-child(8),&:nth-child(11){
          background: darken($bg, 4*4%);
        }
        &:nth-child(12),&:nth-child(14) {
          background: darken($bg, 4*5%);
        }
        &:nth-child(15) {
          background: darken($bg, 4*6%);
        }
      }
  }
  .date{
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    background: darken(#f2f2f2, 4*3%);
  }
  .van-popup{
    overflow: hidden;
  }
</style>