<template>
	<view class="content">
		<view class="regLoginBox" v-if="isShowMolie">
			<view class="logo">
				<view class="img">
					<image class="logoimg" src="http://ddyp.wtvxin.com/static/logo.png" mode="widthFix"></image>
					<view class="Title">大单易拼</view>
				</view>
			</view>
			<view class="from pd10">
				<view class="from-line">
					<view :class="['iconfont',logintype?'icon-zh1':'icon-shouji']"></view>
					<input type="text" class="ipt" v-model="tel" value="" placeholder="请输入手机号码" />
				</view>
				<view class="from-line" v-if="logintype">
					<view class="iconfont icon-mima"></view>
					<input type="password" class="ipt" v-model="pwd" value="" placeholder="请输入密码" />
				</view>
				<view class="from-line" v-else>
					<view class="iconfont icon-mima"></view>
					<input type="text" class="ipt" value="" v-model="code" placeholder="请输入验证码" />
					<view class="getcode" @click="getCode">{{codeMsg}}</view>
				</view>
				<view class="from-line text_r" style="margin:0;display: none;" @click="changeWay">
					<text class="c_theme" v-if="logintype">手机验证码登录</text>
					<text class="c_theme" v-if="!logintype">密码登录</text>
				</view>
				<view class="ftbtn" style="padding:40upx 0 20upx 0;">
					<button type="primary" @click="btnSubmit" class="btn">登录</button>
				</view>
				<view class="form-line aLine" style="margin:0 30upx;">
					<view @click="register" class="inline-block aline">没有账号？注册账号</view>
					<view v-if="logintype" @click="getPassword" class="inline-block aline fr">忘记密码?</view>
				</view>
			</view>
			<!-- 其他登录方式 -->
			<view class="Otherway center" v-if="false">
				<view class="title"><text class="txt">其他登录方式</text></view>
				<view class="waylist flex">
					<view class="flex-item" @click="changeWay(1)">
						<view class="iconfont icon-weixin1" style="background: #09BB07;"></view>
						<view class="name">微信</view>	
					</view>
					<view class="flex-item" @click="changeWay(2)">
						<view :class="['iconfont',logintype?'icon-shouji':'icon-zh1']"></view>
						<view class="name">{{logintype?'手机':'账号'}}</view>	
					</view>
				</view>	
			</view>
		</view>
		<!-- #ifdef MP-WEIXIN -->  
		<view class="MP-login" v-if="isShowminiApp">
		    <view class="logo">
		        <image class="logoimg" src="http://ddyp.wtvxin.com/static/logo.png" mode="widthFix"></image>
				<view class="Title">大单易拼</view>
		    </view> 
		    <button class="login-btn btn_gree" open-type="getUserInfo" @click="oauth">微信登录</button>
		    <view class="c_blue uni-center" @click="loginTel">手机号登录/注册</view>
		</view>
		<!-- #endif -->  
	</view>
</template>

<script>
	import {host,post,get,valPhone,setRegular} from '@/common/util.js';
	import '@/common/login.css';
	export default {
		onLoad(){
			
		},
		onShow(){
			if(this.$root.$mp.query.askUrl){
				this.askUrl = this.$root.$mp.query.askUrl.toString().replace(/\%3F/g, '?').replace(/\%3D/g, '=').replace(/\%26/g, '&');
			}
			// #ifdef MP-WEIXIN
			this.isShowMolie=false;
			this.isShowminiApp = true;
			// #endif
		},
		data() {
			return {
				tel:"",
				pwd:"",
				askUrl: "",
				code:"",
				codeMsg: "获取验证码",
				timer : null,
				count:"",
				has_click: false,
				logintype:true,//true表示密码登录，false手机验证码登录
				isShowMolie:true,//是否显示号登录界面
				isShowminiApp:true//是否显示小程序登录
			};
		},
		methods: {
			changeWay(e){
				if(e==1){
					// #ifdef MP-WEIXIN
					this.isShowMolie=false;
					this.isShowminiApp=true;
					// #endif
					// #ifdef H5
					uni.showToast({
						title: "暂不支持该方式",
						icon: "none",
						duration: 2000
					});
					// #endif
				}else{
					this.logintype=!this.logintype;
					if(!this.logintype){
						this.pwd=""
					}
				}
			},
			//获取验证码
			getCode() {
				if (valPhone(this.tel)) {
					if (!this.has_click) {
						this.sendCode();
					}
				}
			},
			async sendCode() {
				let result = await post("Login/GetUserSms", {
					"Mobile": this.tel,
					"VerifyType": 1
				});
				if (result.code === 0) {
					this.has_click = true;
					const TIME_COUNT = 90; // 90s后重新获取验证码
					this.count = TIME_COUNT;
					uni.showToast({
						title: "发送成功，请注意查收!",
						icon: "none",
						duration: 2000
					});
					this.timer = setInterval(() => {
						if (this.count > 0 && this.count <= TIME_COUNT) {
							this.count--;
							this.codeMsg = this.count + "s后重新获取";
						} else {
							clearInterval(this.timer);
							this.timer = null;
							this.codeMsg = "获取验证码";
						}
					}, 1000);
			
				} else {
					this.has_click = false;
					uni.showToast({
						title: result.msg,
						icon: "none",
						duration: 2000
					});
				}
			},
			valOther(){
				if(this.logintype){
					if(this.pwd==""){
						uni.showToast({
						  title: "请输入密码!",
						  icon: "none",
						  duration: 2000
						});
						return false;
					}
					if(this.pwd.length<6){
						uni.showToast({
						  title: "密码长度不能小于6个字符!",
						  icon: "none",
						  duration: 2000
						});
						return false;
					}
				}else{
					if(this.code == ""){
						uni.showToast({
						  title: "请输入验证码!",
						  icon: "none",
						  duration: 2000
						});
						return false;
					}
				}
				return true;
			},
			btnSubmit() {
				if(valPhone(this.tel) && this.valOther()){
					this.login();
				}
			},
			async login(){
				let result;
				if(this.logintype){
					result = await post("Login/LoginByMobile",{
						"mobile": this.tel,
					    "password": this.pwd
					})
				}else{
					result = await post("Login/MemberLoginByCode",{
						"Mobile": this.tel,
					    "VerifyCode": this.code
					})
				}
				if(result.code===0){
					uni.setStorageSync('token', result.data.Token);
					uni.setStorageSync('userId', result.data.UserId);
					let _this = this;
					uni.showToast({
					     title: "登录成功!",
					     icon: "none",
					     duration: 2000,
						 success:function(){
							setTimeout(function() {
								uni.navigateBack();
								// if(_this.askUrl){
								//   if(_this.askUrl.indexOf("undefined")>-1){
								// 	uni.switchTab({
								// 	  url: "/pages/tabBar/my/my"
								// 	});
								//   }
								//   else if(_this.askUrl.indexOf("cart")>-1){
								// 	uni.switchTab({
								// 	  url: "/pages/tabBar/cart/cart"
								// 	});
								//   }
								//   else if(_this.askUrl.indexOf("/my/my")>-1){
								// 	uni.switchTab({
								// 	  url: "/pages/tabBar/my/my"
								// 	});
								//   }
								//   else if(_this.askUrl.indexOf("/discover/discover")>-1){
								// 	uni.switchTab({
								// 	  url: "/pages/tabBar/discover/discover"
								// 	});
								//   }
								//   else{
								// 	  uni.redirectTo({
								// 		url: _this.askUrl
								// 	  });
								//   }
								// }else{
								//   uni.switchTab({
								// 	url: "/pages/tabBar/my/my"
								//   });
								// }
							 }, 2000);
						 }
					});
					console.log(result.data);
// 					uni.switchTab({
// 						url:"/pages/tabBar/my/my"
// 					})
				}else{
					uni.showToast({
					  title: result.msg,
					  icon: "none",
					  duration: 2000
					});
				}
			},
			// 小程序登录
			async MPlogin(code, iv, encryptedData){
				let result=await post("Login/SignIn_New",{
					iv:iv,
					code:code,
					encryptedData:encryptedData
				})
				uni.setStorageSync("unionid", result.data.unionid);
				uni.setStorageSync("token", result.data.Token);
				uni.setStorageSync("userId", result.data.UserId);
				uni.setStorageSync("openId", result.data.openId);
				console.log(result.data,"mmmmmmmmmmmm")
				if(result.code===0){
					let _this = this;
					uni.showToast({
					  title: "登录成功!",
					  icon: "none",
					  duration: 2000,
					  success:function(){
						setTimeout(function() {
							uni.switchTab({
							  url: "/pages/tabBar/my/my"
							});
							// uni.navigateBack();
							// if(_this.askUrl){
							//   if(_this.askUrl.indexOf("undefined")>-1){
							// 	uni.switchTab({
							// 	  url: "/pages/tabBar/my/my"
							// 	});
							//   }
							//   if(_this.askUrl.indexOf("cart")>-1){
							// 	uni.switchTab({
							// 	  url: "/pages/tabBar/cart/cart"
							// 	});
							//   }
							//   if(_this.askUrl.indexOf("/my/my")>-1){
							// 	uni.switchTab({
							// 	  url: "/pages/tabBar/my/my"
							// 	});
							//   }
							//   if(_this.askUrl.indexOf("/discover/discover")>-1){
							// 	uni.switchTab({
							// 	  url: "/pages/tabBar/discover/discover"
							// 	});
							//   }
							//   uni.redirectTo({
							// 	url: _this.askUrl
							//   });
							// }else{
							//   uni.switchTab({
							// 	url: "/pages/tabBar/my/my"
							//   });
							// }
						 }, 2000);
					  }
					});
				}else if (result.code === 2) {
					uni.showToast({
						title: result.msg,
						icon: 'none',
						duration: 1500,
						success: function() {
							setTimeout(function() {
								wx.redirectTo({
									url: '/pages/register/register?type=1'
								})
							}, 1500);
						}
					})
				}
				else{
					uni.showToast({
					  title: result.msg,
					  icon: "none",
					  duration: 2000
					});
				}
			},
			oauth(){
				uni.login({
					success:(res)=>{
						 uni.getUserInfo({
						    success: (infoRes) => {
						        /**
						         * 实际开发中，获取用户信息后，需要将信息上报至服务端。
						         * 服务端可以用 userInfo.openId 作为用户的唯一标识新增或绑定用户信息。
						         */
								uni.setStorageSync("userInfo", infoRes.userInfo);
								this.MPlogin(res.code, infoRes.iv, infoRes.encryptedData);
						    }
						});
					},
					fail: (err) => {
					    console.error('授权登录失败：' + JSON.stringify(err));
					}
				})
			},
			//微信跳转登录
			loginTel(){
				this.isShowMolie=true;
				this.isShowminiApp=false;
			},
			//注册
			register(){
				uni.navigateTo({
					url: '/pages/register/register'
				})
			},
			//忘记密码
			getPassword(){
				uni.navigateTo({
					url: '/pages/getPassword/getPassword'
				})
			}
		}
	}
</script>
<style>
  .content{
	  background:#fff;
	  background-size: 100% 100%;
	  min-height: 100%;
	  position: relative;
	  box-sizing: border-box;
  }
  .regLoginBox{
	  width: 90%;
	  position: absolute;
	  top: 50%;
	  left: 5%;
	  transform: translateY(-50%);
	  border-radius: 20rpx;
	  box-sizing: border-box;
  }
  .from-line{
	  background: #fff;
	  border-radius: 40rpx;
  }
</style>
