<template>
  <Layout class-prefix="layout">
    <Tags2 @change='onUpdateTags' ref='tags'></Tags2>
    <!-- <div class="createAt">
      <FormItem field-name='日期'
        type="date"
        placeholder="在这里输入日期"
        :value.sync = "record.createAt"
      />
    </div> -->
    <div slot="num">
        <div class="notes">
          <FormItem field-name="备注"
            placeholder="写点备注吧..."
            :value.sync="record.notes"
          />
        </div>
        <Tabs :data-source="recordTypeList" :value.sync="record.type"/>
        <NumberPad :value.sync="record.amount" @submit="saveRecord"/>
    </div>
    <Nav slot="footer"></Nav>
  </Layout>
</template>

<script lang="ts">
import Vue from "vue";
import NumberPad from "@/components/Money/NumberPad.vue";
import FormItem from '@/components/Money/FormItem.vue';
import Tags2 from "@/components/Money/Tags2.vue";
import { Component,Watch } from "vue-property-decorator";
import Tabs from '@/components/Tabs.vue';
import recordTypeList from '@/constants/recordTypeList';
import { Notify } from "vant";

@Component({
  components: { Tags2, FormItem, Tabs, NumberPad },
})
export default class Money extends Vue {
  get recordList() {
    return this.$store.state.recordList;
  }
  public $refs!:{
    tags:Tags2
  }
  recordTypeList = recordTypeList;
  
  record: RecordItem = {
    tags: [],
    notes: "",
    type: "-",
    amount: 0,
    createdAt: new Date().toISOString()
  };

  created(){
    this.$store.commit('fetchRecords');
  }
  
  onUpdateTags(value:any){
    this.record.tags.splice(0,1,...value[0]);
  }

  saveRecord() {
    if(this.record.tags.length===0){
        Notify({ type: 'warning', message: '请选择一个标签！',
            duration:1000,});
    }else{
      this.$store.commit('createRecord',this.record);
      this.record.notes='';
      this.$refs.tags.active = -1
    }
  }

}
</script>

<style lang="scss">
.layout-content {
  display: flex;
  flex-direction: column;
}
.notes {
  border: 5px solid rgba(214, 200, 212, 0.685);
}
</style>