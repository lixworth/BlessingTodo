'use strict';

const Controller = require('egg').Controller;
const JWT = require('jsonwebtoken');
const bcrypt = require('bcrypt');

class UserController extends Controller {
    async login() {
        const { ctx } = this;
        const code = this.ctx.request.body.code;
        var wechat = await ctx.curl('https://api.weixin.qq.com/sns/jscode2session?appid='+this.config.wechatappid+'&secret='+this.config.wechatsecret+'&js_code='+code+'&grant_type=authorization_code',{
            method: 'GET',
            dataType: 'json'
        });
        if(!wechat.data.errcode){
            const user = await this.ctx.service.user.find(wechat.data.openid);
            if(user.user === null){
                this.app.logger.info("OpenID:"+wechat.data.openid+" 不存在 开始注册")
                if (this.ctx.service.user.create(wechat.data.openid,wechat.data.session_key)){
                    const new_user = await this.ctx.service.user.find(wechat.data.openid);
                    this.app.logger.info("OpenID:"+wechat.data.openid+" 注册成功");
                    const userToken = JWT.sign({
                        id: new_user.user.id,
                        openid: new_user.user.openid
                    }, this.config.jwt.secret, {
                        algorithm: 'RS256',
                        expiresIn: '2d',
                    });
                    this.app.logger.info("UID:"+new_user.user.id+" OpenID:"+wechat.data.openid+" 登录系统 已颁发Token:" + userToken);
                    return this.ctx.body = {success:true,token:userToken};
                }else{
                    return this.ctx.body = {success:false,message: "注册失败"};
                }
            }
            const userToken = JWT.sign({
                id: user.user.id,
                openid: user.user.openid
            }, this.config.jwt.secret, {
                algorithm: 'RS256',
                expiresIn: '2d',
            });
            if(user.user.session_key !== wechat.data.session_key){
                if(!await this.ctx.service.user.update_session(user.user.id,wechat.data.session_key)){
                    this.app.logger.info("UID:"+user.user.id+" OpenID:"+wechat.data.openid+" session key写入失败 拒绝登录");
                    return this.ctx.body = {success:false};
                }
                this.app.logger.info("UID:"+user.user.id+" OpenID:"+wechat.data.openid+" 登录系统 已更新session key并颁发Token:" + userToken);
                return this.ctx.body = {success:true,token: userToken};
            }
            this.app.logger.info("UID:"+user.user.id+" OpenID:"+wechat.data.openid+" 登录系统 已颁发Token:" + userToken);
            return this.ctx.body = {success:true,token: userToken};
        }else{
            return this.ctx.body =  {
                success:false,
                errcode:wechat.data.errcode,
                errmsg:wechat.data.errmsg,
                message:"ErrCode"
            };
        }
    }


}

module.exports = UserController;
