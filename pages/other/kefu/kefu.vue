<template>
	<view>
		<view class="kefu_top">
			<view class="kefu_img">
				<image src="/static/qq.png"></image>
			</view>
			<view class="kefu_detail">在线客服<view>(09:00~22:00)</view></view>
		</view>
		<view class="kefu_desc">所有常见问题都有相应的解决方案，请参考常见问题自主解决，如 果常见问题无法解决您的问题在咨询客服，由于客服咨询量较大， 请尽可能的描述清楚您的问题，以便快速解决</view>
		<view class="kefu_btn" @click="gokefu()">
			QQ咨询
		</view>
	</view>
</template>

<script>
	import {host,post,get,toLogin} from '@/common/util.js';
	export default {
		data() {
			return {
				qqnum:""
			}
		},
		onShow() {
			this.getinfo()
		},
		methods: {
			async getinfo(){
				let res=await get('system/GetWebConfiguration',{})
				if(res.code==0){
					this.qqnum=res.data.WebQQ
				}
			},
			gokefu(){
				// #ifdef H5
				window.location.href ="http://wpa.qq.com/msgrd?v=3&uin="+this.qqnum+"&site=qq&menu=yes"
				// #endif
				// #ifdef APP-PLUS
				plus.runtime.openURL('mqq://im/chat?chat_type=wpa&uin=' + this.qqnum + '&version=1&src_type=web ');
				// #endif
			}
		}
	}
</script>

<style>
.kefu_top{
	display: flex;justify-content: flex-start;align-items: center;
	padding:30upx;
	background: #ffffff;border-bottom:1upx solid #f2f2f2;
}
.kefu_detail{
	display: flex;justify-content: flex-start;align-items: center;
}
.kefu_img{
	width:60upx;height:60upx;margin-right:10upx;
}
.kefu_img image{
	width:100%;height:100%;
}
.kefu_desc{
	background: #ffffff;padding:30upx;font-size:24upx;color:#999999
}
.kefu_btn{
	width:90%;
	background: #ee9b11;
	margin:80upx auto;
	border-radius:15upx;
	padding:10upx 0;text-align: center;
}
.kefu_btn a{
	color:#ffffff;
	text-decoration: none;
}
</style>
