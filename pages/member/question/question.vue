<template>
	<view class="question">
		<view class="qu_list uni-mt10">
			<view class="qu_item" v-for="(item,index) in datalist" :key="index" @click="showDetail(item,index)">
				<view class="flex flexAlignCenter item_head bg_fff">
					<view class="title flex flexAlignCenter flex1">
						<span class="spill">{{index+1}}</span>
						<view>{{item.Title}}</view>
					</view>
					<span class="iconfont fz12" :class="item.isShow?'icon-iconset0418':'icon-arrow_r'"></span>
				</view>
				<view class="content" v-if="item.isShow">
					<uParse :content="item.Contents" />
				</view>
			</view>
			<!-- <view class="uni-tab-bar-loading">
				<uni-load-more :loadingType="loadingType"></uni-load-more>
			</view> -->
		</view>
		<noData :isShow="noDataIsShow"></noData>
	</view>
</template>

<script>
	import {host,post,get,dateUtils,toLogin,getCurrentPageUrlWithArgs} from '@/common/util.js';
	import noData from '@/components/noData.vue'; //暂无数据
	import uniLoadMore from '@/components/uni-load-more.vue'; //加载更多
	import uParse from '@/components/uParse/src/wxParse.vue';
	export default{
		components: {
			uParse,
			noData,
			uniLoadMore
		},
		data(){
			return{
				userId: "",
				token: "",
				curPage:"",
				loadingType: 0, //0加载前，1加载中，2没有更多了
				isLoad: false,
				hasData: false,
				noDataIsShow: false,
				page: 1,
				pageSize: 10,
				allPage: 0,
				count: 0,
				datalist:[],
				content:''
			}
		},
		onShow(){
			this.userId = uni.getStorageSync("userId");
			this.token = uni.getStorageSync("token");
			this.curPage = getCurrentPageUrlWithArgs().replace(/\?/g, '%3F').replace(/\=/g, '%3D').replace(/\&/g, '%26');
			if (toLogin(this.curPage)) {
				this.HelpList();
			}
			
			
		},
		methods:{
			//展示详情
			showDetail(item,i){
				this.datalist.map((value,index)=>{
					if(index == i){
						if(value.isShow){
							this.$set(value,"isShow",false)
						}else{
							this.$set(value,"isShow",true)
						}
					}else{
						this.$set(value,"isShow",false)
					}
				})
				// this.getDetail(item)
			},
			async HelpList() {
				let result = await post("Help/HelpList", {
					UserId: this.userId,
					Token: this.token,
					page: this.page,
					pageSize: this.pageSize
				});
				if (result.code === 0) {
					let _this=this;
					if (result.data.length > 0) {
						result.data.map(item=>{
							this.$set(item,"isShow",false)
						})
						this.hasData = true;
						this.noDataIsShow = false
					}else{
						this.noDataIsShow = true;
					}
					this.count = result.count;
					if (this.count == 0) {
						
					}
					if (parseInt(this.count) % this.pageSize === 0) {
						this.allPage = this.count / this.pageSize;
					} else {
						this.allPage = parseInt(this.count / this.pageSize) + 1;
					}
					if (this.page === 1) {
						this.datalist = result.data;
					}
					if (this.page > 1) {
						this.datalist = this.datalist.concat(
							result.data
						);
					}
					this.datalist.sort(this.sortId)
					if (this.allPage <= this.page) {
						this.isLoad = false;
						this.loadingType = 2;
					} else {
						this.isLoad = true;
						this.loadingType = 0
					}
				} else if (result.code === 2) {
					let _this =this;
					uni.showModal({
						content: "您还没有登录，是否重新登录？",
						success(res) {
							if (res.confirm) {
								uni.navigateTo({
								  url: "/pages/login/login?askUrl="+_this.curPage
								});
							} else if (res.cancel) {
							}
						}
					});
				} else {
					uni.showToast({
						title: result.msg,
						icon: "none",
						duration: 2000
					});
				}
			},
			sortId(a,b){
				return b.IsTop-a.IsTop
			}
		},
		onReachBottom: function() {
			if (this.isLoad) {
				this.loadingType = 1;
				this.page++;
				this.HelpList();
			} else {
				this.loadingType = 2;
			}
		}
	}
</script>

<style lang="scss" scoped>
	@import "./style";
</style>
