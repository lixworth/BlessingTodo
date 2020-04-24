'use strict';

const Controller = require('egg').Controller;
const JWT = require('jsonwebtoken');

class UserController extends Controller {
    async login() {
        const { ctx } = this;
        const code = this.ctx.request.body.code;
        const wxuser = this.ctx.request.body.user;
        this.ctx.logger.info(wxuser);
        var wechat = await ctx.curl('https://api.weixin.qq.com/sns/jscode2session?appid='+this.config.wechatappid+'&secret='+this.config.wechatsecret+'&js_code='+code+'&grant_type=authorization_code',{
            method: 'GET',
            dataType: 'json'
        });
        if(!wechat.data.errcode){
            const user = await this.ctx.service.user.find(wechat.data.openid);
            if(user.user === null){
                this.app.logger.info("OpenID:"+wechat.data.openid+" 不存在 开始注册")
                if (await this.ctx.service.user.create(wechat.data.openid,wechat.data.session_key,wxuser.nickName,wxuser.avatarUrl)){
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
            if(user.user.session_key !== wechat.data.session_key || user.user.nickname !== wxuser.nickName || user.user.avatar !== wxuser.avatarUrl){
                if(await this.ctx.service.user.update_session(user.user.id,wechat.data.session_key,wxuser.nickName,wxuser.avatarUrl)) {
                    this.app.logger.info("UID:"+user.user.id+" OpenID:"+wechat.data.openid+" 登录系统 已更新用户信息 并颁发Token:" + userToken);
                    return this.ctx.body = {success:true,token: userToken};
                }else{
                    this.app.logger.info("UID:"+user.user.id+" OpenID:"+wechat.data.openid+"  更新用户信息 失败 拒绝登录");
                    return this.ctx.body = {success:false};
                }
            }
            this.app.logger.info("UID:"+user.user.id+" OpenID:"+wechat.data.openid+" 登录系统 已颁发Token:" + userToken);
            return this.ctx.body = {success:true,token: userToken};
        }else{
            return this.ctx.body =  {
                success:false,
                errcode: wechat.data.errcode,
                errmsg: wechat.data.errmsg,
                message:"ErrCode"
            };
        }
    }

    async getUser() {
        const { ctx } = this;
        var authToken = ctx.header.authorization;
        const auth = JWT.verify(authToken, fs.readFileSync(path.resolve(__dirname, '../jwt_pub.pem')));
        const user = await this.ctx.service.user.select(auth.id);
        if(user.user === null) {
            ctx.status = 401;
            return this.ctx.body = {
                success: false,
                message: "用户不存在"
            };
        }
        return this.ctx.body = user;
    }
}

module.exports = UserController;
