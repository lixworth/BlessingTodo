'use strict';

const Controller = require('egg').Controller;

class UserController extends Controller {
    async login() {
        const { ctx } = this;
        const code = this.ctx.request.body.code;
        const wechat = await this.app.curl('https://api.weixin.qq.com/sns/jscode2session?appid='+this.config.wechatappid+'&secret='+this.config.wechatsecret+'&js_code='+code+'&grant_type=authorization_code',{
            method: 'GET',
            dataType: 'json',
        });
        if(!wechat.data.errcode){
            const user = ctx.service.user.find(wechat.data.openid);
            if(user.length === 0){
                //TODO: 更新session key 返回token
                return ctx.body = {success:user};
            }else{
                if (ctx.service.user.create(wechat.data.openid,wechat.data.session_key)){
                    //注册成功
                    return ctx.body = {success:true};

                }else{
                    return ctx.body = {success:false};
                }
            }
        }else{
            return this.ctx.body = {success:false,errcode:wechat.data.errcode,errmsg:wechat.data.errmsg};
        }
    }
}

module.exports = UserController;
