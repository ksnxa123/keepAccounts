<template>
    <Layout>
        <div slot="header" class="nav">
            <div class="navBar">
                <Icon class="leftIcon" name='left' @click.native="goBack"></Icon>
                <span class="title">编辑标签</span>
                <span class="ok" @click="ok">完成</span>
            </div>
            <div class="navbar2">
                <span>选中标签:</span>
                <div v-for="(item,index) in rSelect" :key='index'>
                    <Icon :name='item+"-actived"'></Icon>
                </div>
            </div>
        </div>
        <div class="detail" v-for="(item,index) in detail" :key='index'>
            <div class="title">{{detail[index].title}}</div>
            <ul>
                <li v-for="(item1,index1) in detail[index].children" :key='index1' @click="selected(item1.type,item1,detail[index].title)" :class="{'active':rSelect.indexOf(item1.type)!=-1}">
                    <Icon :name='rSelect.indexOf(item1.type)!=-1?item1.type+"-actived":item1.type'></Icon>
                    <span>{{item1.name}}</span>
                </li>
            </ul>
        </div>
    </Layout>
</template>

<script lang='ts'>
    import { Notify } from 'vant';
    import Vue from 'vue';
    import {Component} from 'vue-property-decorator';

    @Component({})
    export default class Label extends Vue {
        get tags(){
          return this.$store.state.tagList;
        }
        rSelect:string[]=[];
        rSelect2:string[]=[];
        detail= [{
                title:'公交',
                children:[
                    {type:'car',name:'公交'},
                    {type:'taxi',name:'出租'},
                    {type:'plane',name:'飞机'},
                    {type:'train',name:'火车'},
                    {type:'subway',name:'地铁'}
                ]
            },{
                title:'餐饮',
                children:[
                    {type:'foot',name:'餐饮'},
                    {type:'food1',name:"零食"},
                    {type:"food2",name:'外卖'},
                    {type:'food3',name:'买菜'},
                    {type:"food4",name:'酒水'}
                ]
            },{
                title:'娱乐',
                children:[
                    {type:"play2",name:'娱乐'},
                    {type:'play',name:"游戏"},
                    {type:'movie',name:'电影'},
                    {type:'run',name:'运动'},
                    {type:'traveling',name:"旅游"}
                ]
            },{
                title:'购物',
                children:[
                    {type:"shopping",name:'购物'},
                    {type:'clothes',name:'衣服'},
                    {type:'cosmetics',name:"化妆品"},
                    {type:'digital',name:'数码'}
                ]
            },{
                title:'生活居住',
                children:[
                    {type:'stay',name:'生活居住'},
                    {type:'daily',name:'生活用品'},
                    {type:'hcost',name:'话费'},
                    {type:'lottery',name:'彩票'},
                    {type:'scost',name:'水电费'}
                ]
            },{
                title:"医疗",
                children:[
                    {type:"medical",name:'医疗'},
                    {type:'drug',name:'药品'},

                ]
            }
        ]
        ok(){       
            this.rSelect = [];
            this.$router.push({path:'/money'});
            this.$store.commit('createTag',this.rSelect2)
            this.rSelect2=[];
        }
        selected(type:any,item1:any,title:any){
            const tagTypes = this.tags.map((item: { type: any; })=> item.type)
            if(tagTypes.indexOf(type)>=0){
                Notify({ type: 'warning', message: '标签已经添加过了！',
                    duration:1000,});
                return
            }
            if(this.rSelect.indexOf(type)!==-1){
                this.rSelect.splice(this.rSelect.indexOf(type),1)//再次选择取消
                this.rSelect2.splice(this.rSelect2.indexOf(type),1)
            }else{
                if(this.rSelect.length<5){
                    this.rSelect.push(type);
                    let key = 'title';
                    item1[key] = title;
                    this.rSelect2.push(item1)
                }else{
                    console.log('不能加了');
                }
            }
        }
        goBack(){
          this.$router.back();
        }
    }
</script>

<style lang="scss" scoped>
    .nav{
        display: flex;
        flex-direction: column;
    }
    .navBar {
        text-align: center;
        font-size: 16px;
        padding: 12px 16px;
        background: #1296db;
        display: flex;
        align-items: center;
        justify-content: space-between;
        > .title {
            font-weight: bond;
            font-size: 20px;
            color:#fff;
        }
        > .leftIcon {
        width: 24px;
        height: 24px;
        }
        > .ok{
            color: red;
        }
    }
    .navbar2{
        text-align: center;
        font-size: 20px;
        padding: 12px 16px;
        border-bottom: 1px solid #A4A4A4;
        background: #fff;
        display: flex;
        align-items: center;
        flex-wrap: nowrap;
        >span{
            flex-basis: 100px;
        }
        >div{
            flex-basis: 48px;
            >.icon{
                height: 20px;
                width: 20px;
            }
        }
    }
    .detail{
        display: flex;
        flex-direction: column;
        border-bottom: 1px solid #D8D8D8;
        .title{
            font-size: 14px;
            color: #999;
            text-align: center;
            padding: 5px 0 20px 0;
        }
        ul{
            display: flex;
            flex-wrap: wrap;
            font-size: 12px;
            li{
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                width: 25%;
                padding: 0 0 15px 0;
                .icon{
                    width: 30px;
                    height: 30px;
                }
            }
        }
    }
    // 选中变红
    .active{
        color: #1296db;
    }
</style>