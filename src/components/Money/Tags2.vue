<template>
  <div class="tags">
    <div class="item">
      <ul>
        <li v-for="(item,index) in tagList" :key='index' @click="select(index,item)" :class="{'active':active==index}">
            <Icon :name='active==index ? item.type+"-actived":item.type'></Icon>
            <span>{{item.name}}</span>
        </li>
        <li  @click="toCreateTag" class="item1">
          <Icon name='add'></Icon>
          <span>添加标签</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script lang="ts">
  import Vue from 'vue';
  import {Component, Prop,Watch} from 'vue-property-decorator';
  import {mixins} from 'vue-class-component';
  import TagHelper from '@/mixins/TagHelper';
  import Icon from '.././Icon.vue'

  @Component({
    components: { Icon },
  })
  export default class Tags extends mixins(TagHelper) {

    get tagList() {
      return this.$store.state.tagList;
    }
    selectedTags:string[] = [];
    active=-1;

    created(){
      this.$store.commit('fetchTags');
    }

    select(index:any,item:any){
      this.active=index;
      this.selectedTags.splice(0,1,JSON.parse(JSON.stringify(item)));
      this.$emit('change',[this.selectedTags,this.active])
   }


    toCreateTag(){
      this.$router.push({path:'/label',})
    }
  }
</script>

<style lang="scss" scoped>
  .tags {
    font-size: 14px;
    padding: 16px;
    display: flex;
    flex-direction: column;
    > .item {
      padding: 2px 0;
      display: flex;
      flex-direction: column;
      .icon {
        width: 32px;
        height: 32px;
      }
      >ul{
        display: flex;
        flex-wrap: wrap;
        >li{
          display: flex;
          justify-content: center;
          align-items: center;
          flex-direction: column;
          width: 25%;
        }
      }
    }
  }
  .active{
      color: #1296db;
  }


</style>