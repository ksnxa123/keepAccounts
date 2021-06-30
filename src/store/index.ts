import Vue from 'vue';
import Vuex from 'vuex';
import clone from '@/lib/clone';
import createId from '@/lib/createId';
import router from '@/router';
import tagListModel from '@/models/tagListModel';

Vue.use(Vuex);

const store = new Vuex.Store({
  state: {
    recordList: [],
    tagList: [],
    currentTag: undefined
  } as RootState,
  mutations: {
    setCurrentTag(state, id: string) {
      state.currentTag = state.tagList.filter(t => t.id === id)[0];
    },
    updateTag(state, payload: { id: string, name: string }) {
      const {id, name} = payload;
      const idList = state.tagList.map(item => item.id);
      if (idList.indexOf(id) >= 0) {
        const names = state.tagList.map(item => item.name);
        if (names.indexOf(name) >= 0) {
          window.alert('标签名重复了');
        } else {
          const tag = state.tagList.filter(item => item.id === id)[0];
          tag.name = name;
          store.commit('saveTags');
        }
      }
    },
    removeTag(state, id: string) {
      let index = -1;
      for (let i = 0; i < state.tagList.length; i++) {
        if (state.tagList[i].id === id) {
          index = i;
          break;
        }
      }
      if (index >= 0) {
        state.tagList.splice(index, 1);
        store.commit('saveTags');
        router.back();
      } else {
        window.alert('删除失败');
      }

    },
    fetchRecords(state) {
      state.recordList = JSON.parse(window.localStorage.getItem('recordList') || '[]') as RecordItem[];
    },
    createRecord(state, record) {
      const record2: RecordItem = clone(record);
      record2.createdAt = new Date().toISOString();
      state.recordList.push(record2);
      store.commit('saveRecords');
    },
    // 删除一条账单
    removeRecord(state,createdAt:string){
      let index = -1;
      for (let i = 0; i < state.recordList.length; i++) {
        if (state.recordList[i].createdAt === createdAt) {
          index = i;
          break;
        }
      }
      if (index >= 0) {
        state.recordList.splice(index, 1);
        store.commit('saveRecords');
      } else {
        window.alert('删除失败');
      }
    },
    saveRecords(state) {
      window.localStorage.setItem('recordList',
        JSON.stringify(state.recordList));
    },
    fetchTags(state) {
      state.tagList = JSON.parse(window.localStorage.getItem('tagList') || '[]');
      if(!state.tagList || state.tagList.length === 0){
        const arr = [
          {name:'公交',type:'car',title:"公交"},
          {name:'餐饮',type:"foot",title:'餐饮'},
          {name:"购物",type:"shopping",title:"购物"},
          {name:"娱乐",type:"play2",title:'娱乐'},
          {name:"生活居住",type:"stay",title:'生活居住'},
          {name:"医疗",type:"medical",title:"医疗"},
        ]
        store.commit('createTag',arr);
      }
    },
    createTag(state,rSelect:[{name:string,type:string}]){
      state.tagList.push(...JSON.parse(JSON.stringify(rSelect)));
      store.commit('saveTags')
    },
    saveTags(state) {
      window.localStorage.setItem('tagList', JSON.stringify(state.tagList));
    },
  }
});

export default store;
function state(state: any) {
  throw new Error('Function not implemented.');
}

