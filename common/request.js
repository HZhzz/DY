
import {host} from './util.js'

//请求封装
function request(url, method, data) {
    console.log(host,'host')
    uni.showLoading({
      title: '加载中' //数据请求前loading
    })
    return new Promise((resolve, reject) => {
      uni.request({
        url: host + url, //仅为示例，并非真实的接口地址
        method: method,
        data: data,
        header: {
          'content-type': 'application/json;charset=utf-8' // 默认值
        },
        success: function (res) {
          const ret = res.data;
          if(ret.code===0||ret.code===1||ret.code===2){
             resolve(ret)
         }else{
              uni.showToast({
                  title:ret.msg,
                  icon:'none'
              });
              reject(ret)
         }
        },
        fail: function (error) {
          uni.showToast({
              title:'服务器繁忙，请稍后重试',
              icon:'none'
          });
          reject(error)
        },
        complete: function () {
          uni.hideLoading();
        }
      })
    })
  }
  
  // get请求
export  function get(url, data) {
    return request(url, 'GET', data)
  }
  // post请求
export function post(url, data) {
    return request(url, 'POST', data)
  }


//请求封装,隐藏加载
export function requestHideLoading(url, data,method) {
    return new Promise((resolve, reject) => {
      uni.request({
        url: host + url, //仅为示例，并非真实的接口地址
        method: method,
        data: data,
        header: {
          'content-type': 'application/json;charset=utf-8' // 默认值
        },
        success: function (res) {
          const ret = res.data;
          if(ret.code===0){
             resolve(ret)
         }else{
              uni.showToast({
                  title:ret.msg,
                  icon:'none'
              });
              reject(ret)
         }
        },
        fail: function (error) {
          uni.showToast({
              title:'服务器繁忙，请稍后重试',
              icon:'none'
          });
          reject(error)
        }
      })
    })
  }

