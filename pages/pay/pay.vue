<template>
	<view>
		 <view class="payinfo">
		    <view class="p1">待付款金额</view>
		    <view class="p2 flex flex-center"><view class="yuan">￥</view><view class="payprice">{{orderInfo.TotalPrice}}</view></view>
		    <div class="countTiem">支付剩余时间{{Countdown}}</div>
		  </view>
		  <view class="pay-hd uni-mb10">选择支付方式</view>
		  <view class="pay-bd line-list">
			<block v-for="(item,index) in payway" :key="index"> 
				<view class="line-item flex-between" @click="tabBtn(item.type)">
				  <view class="item-l flex-start">
					<view :class="['icon',item.className]"></view>
					<view class="lab">{{item.typeName}}</view>
				  </view>
				  <view class="item-r">
					<view style="margin: 0;" :class="['IconsCK IconsCK-radio',payType==index?'checked':'']"></view>
				  </view>
				</view>
			</block>
		  </view>
		<view class="ftbtn" style="padding:20upx;">
		    <view :class="['btn',disable?'disabled':'']" @click="submitBtn">立即支付</view>
		</view>
		<pay v-on:hidePay="hidePay" v-on:getPassword="getPassword" v-if="showPay" :allprice="allprice"></pay>
	</view>
</template>

<script>
	import {post,get} from '@/common/util.js';
	import pay from '@/components/pay.vue';
	export default {
		components: {
			pay
		},
		data() {
			return {
				userId: "",
				token: "",
				orderNo:"",
				payType:0, //0微信支付
				payway:[{
					type:0,
					typeName:"微信支付",
					className:"icon_weixin"
				},{
					type:1,
					typeName:"支付宝",
					className:"icon_alipay"
				},{
					type:2,
					typeName:"银联支付",
					className:"icon_yinlian"
				},{
					type:3,
					typeName:"余额支付",
					className:"icon_yue"
				}],
				orderInfo:{}, //订单信息
				allprice:'0',
				source:1,//1来源从下单页，0从订单列表或订单详情
				MemberWallet:0,//会员余额
				Score:0,//会员积分
				hasPayPassword:0, //是否设置支付密码
				showPay:false,//支付密码弹框
				Countdown:'00:00:00',
				disable:false,
				WxOpenid:"",
				WxCode:"",
			}
		},
		onShow(){
			this.userId = uni.getStorageSync("userId");
			this.token = uni.getStorageSync("token");
			this.WxOpenid=uni.getStorageSync("openId");
			this.orderNo=this.$root.$mp.query.orderNo;
			this.source=this.$root.$mp.query.source||0;
			this.PayOrderDetails();
			this.GetMemInfo();
			// #ifdef  MP-WEIXIN
			this.getcode();
			// #endif
		},
		methods: {
			//跳转
			tolink(Url) {
				uni.navigateTo({
					url: Url
				})
			},
			// 判断浏览器环境
			isWeixin() {
			    var ua = navigator.userAgent.toLowerCase();
				if (ua.match(/MicroMessenger/i)=="micromessenger") {
					return true;
				} else {
					return false;
				}
			},
			//获取账户信息
			async GetMemInfo() {
				let result = await post("User/GetMemInfo", {
					UserId: this.userId,
					Token: this.token,
				})
				if (result.code == 0) {
					// this.IsPlus=result.data.IsPlus;
					// this.username=result.data.Mobile;
					this.MemberWallet=result.data.Wallet;
					this.Score=result.data.Score;
					this.hasPayPassword=result.data.IsSetPayPwd;
				}
			},
			//待付款订单信息
			async PayOrderDetails() {
				let result = await post("Order/PayOrderDetails", {
					OrderNo:this.orderNo
				})
				if (result.code == 0) {
					this.orderInfo=result.data;
					this.allprice=this.orderInfo.TotalPrice.toString();
					this.Countdown=this.orderInfo.Hours+':'+this.orderInfo.Minutes+':'+this.orderInfo.Seconds;
					this.downTiem(this.orderInfo.Hours,this.orderInfo.Minutes,this.orderInfo.Seconds);
				}else{
					uni.showToast({
						title: result.msg,
						icon: "none",
						duration: 1500
					});
				}
			},
			//支付倒计时
			downTiem(h,m,s){
				let _this=this;
				let newTime = Date.parse(new Date());
				let timeResidue1 = (h*3600 +m*60 + s*1)*1000;
				let timeDing = 	newTime + timeResidue1; //截止时间
				let timer =setInterval(function(){
					let now = Date.parse(new Date());
					timeResidue1 = timeResidue1 - 1000;
					//定义变量 h,m,s保存倒计时的时间
					//var h,m,s;
					if (timeResidue1>=0) {
						h = Math.floor(timeResidue1/1000/60/60%24);
						m = Math.floor(timeResidue1/1000/60%60);
						s = Math.floor(timeResidue1/1000%60);  
						//将倒计时赋值到div中
           			    _this.Countdown=h+":"+m+":"+s;
					}else{
						_this.disable=true;
						clearInterval(timer)
					}
				},1000)
			},
			tabBtn(index){
				this.payType=index;
			},
			//关闭支付密码弹窗
			hidePay(e){
				this.showPay=false;
				// if(e==0){
				// 	this.showgetout = false;
				// }else{
				// 	this.showgetout = true;
				// }
			},
			//接收支付密码
			getPassword(Password){
				this.ConfirmPay(Password);
			},
			//余额支付
			async ConfirmPay(Password) {
				let result = await post('Order/PaymentOrder',{
					UserId: this.userId,
					Token: this.token,
					OrderNo: this.orderNo,
					Password: Password,
				});
				if (result.code === 0) {
					this.showPay=false;
					uni.redirectTo({
						url: "/pages/payresult/payresult?allprice="+this.orderInfo.TotalPrice+"&orderNo="+this.orderNo
					})
				}else if(result.code === 102){
					uni.showModal({
						content: "您还没有设置支付密码，去设置？",
						success(res) {
							if (res.confirm) {
								uni.redirectTo({
									url:"/pages/member/pwdSet/pwdSet"
								})
							} else if (res.cancel) {
							}
						}
					});
				}else{
					let _this=this;
					//_this.showgetout = false;
					uni.showToast({
						title: result.msg,
						icon: "none",
						duration: 1500,
					});
					setTimeout(function(){
						_this.showPay=true;
					},1500)
				}
			},
			getcode(){
			    let _this=this;
				uni.login({
					success: function(res) {
					  if (res.code) {
						_this.WxCode=res.code;
					  } else {
						console.log('登录失败！' + res.errMsg)
					  }
					}
				});
			},
			//微信支付
			async payweixin() {
				let NewUrl=this.GetUrlRelativePath() +'/#/pages/payresult/payresult?allprice='+this.orderInfo.TotalPrice+"&orderNo="+this.orderNo;
				let result = await post("Order/ConfirmWeiXinPay", {
					UserId: this.userId,
					Token: this.token,
					orderNo:this.orderNo,
					NewUrl:NewUrl,
					WxCode:this.WxCode,
					WxOpenid:this.WxOpenid,
				})
				if (result.code == 201) {
					window.location.href=result.data;
				}else if(result.code == 0){
					this.callpay(result.data.JsParam);
				}else {
					uni.showToast({
						title: result.msg,
						icon: "none",
						duration: 1500
					});
				}
			},
			//非微信环境 使用微信支付H5
			async H5payweixin() {
				let NewUrl=this.GetUrlRelativePath() +'/#/pages/payresult/payresult?allprice='+this.orderInfo.TotalPrice+"&orderNo="+this.orderNo;
				let result = await post("Order/ConfirmWeiXinWapPay", {
					UserId: this.userId,
					Token: this.token,
					orderNo:this.orderNo,
					NewUrl:NewUrl
				})
				if (result.code == 201) {
					window.location.href=result.data;
				}else if(result.code == 0){
					window.location.href = result.data.mweb_url;
				}else {
					uni.showToast({
						title: result.msg,
						icon: "none",
						duration: 1500
					});
				}
			},
			callpay(param) {
				if(typeof WeixinJSBridge === 'undefined') {
					if(document.addEventListener) {
						document.addEventListener('WeixinJSBridgeReady', this.onBridgeReady(), false);
					} else if(document.attachEvent) {
						document.attachEvent('WeixinJSBridgeReady', this.onBridgeReady());
						document.attachEvent('onWeixinJSBridgeReady', this.onBridgeReady());
					}
				} else {
					this.onBridgeReady(param);
				}
			},
			onBridgeReady(param){
				var parameter = JSON.parse(param);
				WeixinJSBridge.invoke(
					'getBrandWCPayRequest', parameter,
					function(res){
					if(res.err_msg == "get_brand_wcpay_request:ok" ){
					// 使用以上方式判断前端返回,微信团队郑重提示：
					//res.err_msg将在用户支付成功后返回ok，但并不保证它绝对可靠。
					  uni.showToast({
					  	title: "支付成功",
					  	icon: "none",
					  	duration: 1500
					  });
					}else{
						uni.showToast({
							title: "支付失败",
							icon: "none",
							duration: 1500
						});
					} 
			  }); 
			},
			GetUrlRelativePath() {
				var urlStr = '';　　　　
				var url = document.location.toString();　　　　
				var arrUrl = url.split("//");　　　　
				var start = arrUrl[1].split("/");
				urlStr = arrUrl[0] + '//' + start[0];　　　　
				return urlStr;　　
			},	
			
			//小程序支付
			async ConfirmWeiXinSmallPay(){
				  let result= await post("Order/ConfirmWeiXinSmallPay",{
					WxCode: this.WxCode,
					UserId: this.userId,
					Token: this.token,
					OrderNo: this.orderNo,
					WxOpenid:this.WxOpenid 
				  });
				  var payData=JSON.parse(result.data.JsParam)
				  if(result.code===0){
						let _this=this;
					uni.requestPayment({
					  timeStamp: payData.timeStamp,
					  nonceStr: payData.nonceStr,
					  package: payData.package,
					  signType: payData.signType,
					  paySign: payData.paySign,
					  success(res) {
						  _this.type = "";
							_this.showPay=false;
							uni.redirectTo({
								url: "/pages/payresult/payresult?allprice="+_this.orderInfo.TotalPrice+"&orderNo="+_this.orderNo
							})
						},
					  fail(res) {}
					})
				  }
			},
			
			//立即支付
			submitBtn(){
				if(!this.disable){
					if(this.payType==0){//微信支付
						// #ifdef  H5
						if(this.isWeixin()){
							this.payweixin();
						}else{
							this.H5payweixin();
						}
						// #endif
						// #ifdef  MP-WEIXIN
						this.ConfirmWeiXinSmallPay()
						// #endif
					}else if(this.payType==1){
						uni.showToast({
							title: "暂未开通！",
							icon: "none",
							duration: 2000
						});
					}else if(this.payType==2){
						uni.showToast({
							title: "暂未开通！",
							icon: "none",
							duration: 2000
						});
					}else if(this.payType==3){//余额
						if(this.hasPayPassword==1){
							if(this.MemberWallet<this.orderInfo.TotalPrice){
								uni.showToast({
									title: "余额不足，请选择其他支付方式！",
									icon: "none",
									duration: 2000
								});
							}else{
								this.showPay=true;
							}
						}else{
							uni.showModal({
								content:'您还未设置支付密码，无法使用余额支付，是否马上设置？',
								success: function (res) {
									if (res.confirm) {
										uni.navigateTo({
											url:"/pages/other/setpwd/setpwd"
										})
									} else if (res.cancel) {
										console.log('用户点击取消');
									}
								}
							})
						}
					}
				}
			},
		}
	}
</script>

<style scoped>
	page{ background: #fff;}
  .ftbtn{
    position: fixed;
	width: 100%;
	bottom: 0;
	left: 0;
  }
  .ftbtn .btn{ height: 80upx; width: 100%; border-radius: 16upx; background: #FF3333; display: flex; justify-content: center; align-items: center; flex-direction: column; font-size: 30upx; color:  #fff;}
  .ftbtn .btn.disabled{ background-color: #C9C9C9;}
  .payinfo{ background: #ff3333; text-align: center; color: #fff; padding: 40upx 0;}
  .payinfo .p1{font-size: 32upx;}
  .payinfo .p2 .payprice{ font-size: 76upx; line-height: 1.5}
  .payinfo .p2 .yuan{ font-size: 40upx}
  .countTiem{ background: rgba(255,255,255,.2); border-radius: 100px; padding: 4upx 30upx; display: inline-block;}
  .pay-hd{ padding: 20upx 20upx 0; font-size: 32upx; font-weight: 600}
  .pay-bd .line-item .icon {
      height: 72upx;
      width: 72upx;
  }
  .pay-bd .line-item .lab{ padding-left: 20upx; font-size: 30upx}
  .icon_alipay {
      background: url(http://ddyp.wtvxin.com/static/icons/pay_alipay.png) center center no-repeat;
      background-size: cover;
  }
  .icon_weixin {
      background: url(http://ddyp.wtvxin.com/static/icons/pay_weixin.png) center center no-repeat;
      background-size: cover;
  }
  .icon_yinlian {
      background: url(http://ddyp.wtvxin.com/static/icons/pay_yinlian.png) center center no-repeat;
      background-size: cover;
  }
  .icon_yue {
      background: url(http://ddyp.wtvxin.com/static/icons/pay_yue.png) center center no-repeat;
      background-size: cover;
  }
  .real-ipt{ width: 400upx; margin: 0 auto; font-size: 36upx;border: 1px solid #ddd; padding: .1rem;}
</style>
