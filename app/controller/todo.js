'use strict';


var URLSafeBase64 = require('urlsafe-base64');
const JWT = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
var Base64 = require('js-base64').Base64;
const Controller = require('egg').Controller;
var urlencode = require('urlencode');
class TodoController extends Controller {
    async getList() {
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
        const data = JSON.stringify({
            uid: user.user.id
        });
        var result = await ctx.curl(this.config.api+'?pwd=dhdjnb&action=getTodoInWhichExists&data='+urlencode(Base64.encode(data)),{
            dataType: 'json',
            method: 'GET'
        });
        console.log(result.data.all)
        if(result.data.status === 1){
            await Promise.all((result.data.message).all.map(async (item) => {
                if(item.MOTHER === user.user.id){
                    item.MOTHER = "本人";
                }else{
                    const mother_user = await this.app.mysql.get('be_users', {id: item.MOTHER});
                    item.MOTHER = mother_user.nickname;
                }
            }));

            await Promise.all((result.data.message).t.map(async (item) => {
                if(item.MOTHER === user.user.id){
                    item.MOTHER = "本人";
                }else{
                    const mother_user = await this.app.mysql.get('be_users', {id: item.MOTHER});
                    item.MOTHER = mother_user.nickname;
                }
            }));
            await Promise.all((result.data.message).waitTodo.map(async (item) => {
                if(item.MOTHER === user.user.id){
                    item.MOTHER = "本人";
                }else{
                    const mother_user = await this.app.mysql.get('be_users', {id: item.MOTHER});
                    item.MOTHER = mother_user.nickname;
                }
            }));
            await Promise.all((result.data.message).todo.map(async (item) => {
                if(item.MOTHER === user.user.id){
                    item.MOTHER = "本人";
                }else{
                    const mother_user = await this.app.mysql.get('be_users', {id: item.MOTHER});
                    item.MOTHER = mother_user.nickname;
                }
            }));

            return this.ctx.body = result.data;
        }else{
            if(result.data.message.error === "ERR_UID_DECLINED"){
                return this.ctx.body = {
                    success: false,
                    error: 0,
                    message: "暂无数据"
                };
            }
            return this.ctx.body = {
                success: false,
                message: "内部错误"
            };
        }
    }

    async sonComplete(){
        const { ctx } = this;
        var authToken = ctx.header.authorization;
        const mid = this.ctx.request.body.mid;
        const auth = JWT.verify(authToken, fs.readFileSync(path.resolve(__dirname, '../jwt_pub.pem')));
        const user = await this.ctx.service.user.select(auth.id);
        if(user.user === null) {
            ctx.status = 401;
            return this.ctx.body = {
                success: false,
                message: "用户不存在"
            };
        }
        const data = JSON.stringify({
            uid: user.user.id,
            mid: mid
        });
        var sonComplete = await ctx.curl(this.config.api+'?pwd=dhdjnb&action=sonComplete&data='+urlencode(Base64.encode(data)),{
            method: 'GET',
            dataType: 'json'
        });
        return this.ctx.body = sonComplete.data;
    }

    async getTodo(){
        const { ctx } = this;
        var authToken = ctx.header.authorization;
        const tid = this.ctx.query.tid;
        const auth = JWT.verify(authToken, fs.readFileSync(path.resolve(__dirname, '../jwt_pub.pem')));
        const user = await this.ctx.service.user.select(auth.id);
        if(user.user === null) {
            ctx.status = 401;
            return this.ctx.body = {
                success: false,
                message: "用户不存在"
            };
        }
        const data = JSON.stringify({
            tid: tid
        });
        var getTodo = await ctx.curl(this.config.api+'?pwd=dhdjnb&action=getTodo&data='+urlencode(Base64.encode(data)),{
            method: 'GET',
            dataType: 'json'
        });

        if(getTodo.data.status === 1){
            const mother_user = await this.app.mysql.get('be_users', {id: getTodo.data.message.t.MOTHER});
            if(mother_user.id === user.user.id){
                getTodo.data.message.t.is_creator = true;
            }else{
                getTodo.data.message.t.is_creator = false;
            }
            getTodo.data.message.t.MOTHER = {
                uid: mother_user.id,
                name: mother_user.nickname,
                avatar: mother_user.avatar
            };
            for (var i = 0; i < getTodo.data.message.t.SONs.length; i++) {
                var son = await this.app.mysql.get('be_users', {id: getTodo.data.message.t.SONs[i]});
                console.log(son)
                getTodo.data.message.t.SONs[i] = {
                    uid: son.id,
                    name: son.nickname,
                    avatar: son.avatar
                };
            }
            await Promise.all((getTodo.data.message.t).Missions.map(async (item) => {
                for (var i = 0; i < item.SONs_COMPLETED.length; i++) {
                    var son_com = await this.app.mysql.get('be_users', {id: item.SONs_COMPLETED[i]});
                    item.SONs_COMPLETED[i] = {
                        uid: son_com.id,
                        name: son_com.nickname,
                        avatar: son_com.avatar
                    };
                }
            }));
            return this.ctx.body = getTodo.data;
        }else{
            this.ctx.status = 403;
            return this.ctx.body = {
                success: false
            };
        }
    }
    /*loadCode*/
    async loadCode(){
        const { ctx } = this;
        const cid = this.ctx.query.cid;
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

        var getCode = await ctx.curl(this.config.api+'?pwd=dhdjnb&action=getCode&data='+urlencode(Base64.encode(JSON.stringify({
            cid: cid
        }))),{
            method: 'GET',
            dataType: 'json'
        });
        console.log(getCode)
        if(getCode.data.message.c.UID === null){
            getCode.data.message.c.user = null;

        }else{
            const joinuser = await this.ctx.service.user.select(getCode.data.message.c.UID );
            if(joinuser.user === null){
                this.ctx.status = 403;
                return this.ctx.body = {
                    status: 0,
                    success: false,
                    message: getTodo.data.message.error
                };
            }
            getCode.data.message.c.user = joinuser.user;
        }
        if(getCode.data.status === 1){
            var getTodo = await ctx.curl(this.config.api+'?pwd=dhdjnb&action=getTodo&data='+urlencode(Base64.encode(JSON.stringify({
                tid: getCode.data.message.c.TID
            }))),{
                method: 'GET',
                dataType: 'json'
            });
            if(getTodo.data.status === 1){
                const mother_user = await this.app.mysql.get('be_users', {id: getTodo.data.message.t.MOTHER});
                getTodo.data.message.t.MOTHER = mother_user.nickname;
                return this.ctx.body = {
                    status: 1,
                    message: {
                        c: getCode.data.message.c,
                        t: getTodo.data.message.t
                    }
                };
            }else{
                this.ctx.status = 403;
                return this.ctx.body = {
                    status: 0,
                    success: false,
                    message: getTodo.data.message.error
                };
            }
        }else{
            this.ctx.status = 403;
            return this.ctx.body = {
                status: 0,
                success: false,
                message: getCode.data.message.error
            };
        }
    }
    async getCode(){
        const { ctx } = this;
        var authToken = ctx.header.authorization;
        const type = this.ctx.query.type;
        const tid = this.ctx.query.tid;
        const auth = JWT.verify(authToken, fs.readFileSync(path.resolve(__dirname, '../jwt_pub.pem')));
        const user = await this.ctx.service.user.select(auth.id);
        if(user.user === null) {
            ctx.status = 401;
            return this.ctx.body = {
                success: false,
                message: "用户不存在"
            };
        }

        /*        var access_token = await ctx.curl('https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid='+this.config.wechatappid+'&secret='+this.config.wechatsecret,{
                    method: 'GET',
                    dataType: 'json'
                });*/
        if(type === "YQCode"){ //邀请码
            var setCode = await ctx.curl(this.config.api+'?pwd=dhdjnb&action=setCode&data='+urlencode(Base64.encode(JSON.stringify({
                tid: tid,
            }))),{
                method: 'GET',
                dataType: 'json'
            });
        }else if(type === "DCCode"){ //督促码
            var setCode = await ctx.curl(this.config.api+'?pwd=dhdjnb&action=setCode&data='+urlencode(Base64.encode(JSON.stringify({
                tid: tid,
                uid: user.user.id
            }))),{
                method: 'GET',
                dataType: 'json'
            });
        }else {
            this.ctx.status = 403;
            return this.ctx.body = {
                success: false
            };
        }
        if(setCode.data.status === 1){
            /*
            * TODO: 这是一个预留的方案，但是这个接口需要小程序上线之后才可以获取，所以暂时弃用了
            *  这是一个通过生成二维码，使用微信中的扫一扫，一键打开小程序并添加邀请
            * */
            /*var qrcode = await ctx.curl('https://api.weixin.qq.com/wxa/getwxacodeunlimit?access_token='+access_token.data.access_token,{
                method: 'POST',
                dataType: 'json',
                data: {
                    page: "/pages/join/index",
                    scene: "cid="+setCode.data.cid,
                }
            });
            console.log(qrcode.data)
            return this.ctx.body = qrcode.data;*/
            return this.ctx.body = setCode.data;
        }else{
            this.ctx.status = 403;
            return this.ctx.body = {
                status: 0,
                success: false,
                message: setCode.data.message.error
            };
        }
    }
    async fatherJoin(){
        const { ctx } = this;
        var authToken = ctx.header.authorization;
        const tid = this.ctx.request.body.tid;
        const auth = JWT.verify(authToken, fs.readFileSync(path.resolve(__dirname, '../jwt_pub.pem')));
        const user = await this.ctx.service.user.select(auth.id);
        if(user.user === null) {
            ctx.status = 401;
            return this.ctx.body = {
                success: false,
                message: "用户不存在"
            };
        }
        const suid = this.ctx.request.body.suid;
        const suser = await this.ctx.service.user.select(suid);
        if(suser.user === null){
            ctx.status = 401;
            return this.ctx.body = {
                success: false,
                message: "用户不存在"
            };
        }
        if(user.user.id === suid){
            return this.ctx.body = {
                status: 2
            };
        }
        var fatherJoin = await ctx.curl(this.config.api+'?pwd=dhdjnb&action=fatherJoin&data='+urlencode(Base64.encode(JSON.stringify({
            tid: 0,
            fuid: 2,
            suid: 3,
        }))),{
            method: 'GET',
            dataType: 'json'
        });
        return this.ctx.body = fatherJoin.data;
    }

    async sonJoin(){
        const { ctx } = this;
        var authToken = ctx.header.authorization;
        const tid = this.ctx.request.body.tid;
        const auth = JWT.verify(authToken, fs.readFileSync(path.resolve(__dirname, '../jwt_pub.pem')));
        const user = await this.ctx.service.user.select(auth.id);
        if(user.user === null) {
            ctx.status = 401;
            return this.ctx.body = {
                success: false,
                message: "用户不存在"
            };
        }
        var sonJoin = await ctx.curl(this.config.api+'?pwd=dhdjnb&action=sonJoin&data='+urlencode(Base64.encode(JSON.stringify({
            tid: tid,
            uid: user.user.id
        }))),{
            method: 'GET',
            dataType: 'json'
        });

        return this.ctx.body = sonJoin.data;
    }
    async test(){
        const { ctx } = this;
        const user = await this.ctx.service.user.select(1);
        var access_token = await ctx.curl('https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid='+this.config.wechatappid+'&secret='+this.config.wechatsecret,{
            method: 'GET',
            dataType: 'json'
        });
        var test = await ctx.curl('https://api.weixin.qq.com/cgi-bin/message/wxopen/template/uniform_send?access_token='+access_token.data.access_token,{
            method: 'POST',
            dataType: 'json',
            data:{
                touser: "oVGBI41KCziTzzDP-uj8DbRhuEFY",
                weapp_template_msg:{
                    template_id: "zBUFPgODa26jZTF9Z7kTGDlUEKdRXoAGS5ipigEpCgE",
                    page: "/pages/list/list",
                    form_id: "form_id",
                    data: {
                        "thing1.DATA": "测试",
                        "thing4.DATA": "尽快确认todo哦，超过5分钟，会通知监督人",
                        "time5.DATA": "20:10",
                        "phrase6.DATA": "测试",
                        "time11.DATA": "2020-04-27"
                    }
                }
            }
        });
        console.log(test)
    }
    async newtodo(){
        const { ctx } = this;
        var authToken = ctx.header.authorization;
        const todo = this.ctx.request.body.new;
        const auth = JWT.verify(authToken, fs.readFileSync(path.resolve(__dirname, '../jwt_pub.pem')));
        const user = await this.ctx.service.user.select(auth.id);
        if(user.user === null) {
            ctx.status = 401;
            return this.ctx.body = {
                success: false,
                message: "用户不存在"
            };
        }
        var missions = [];
        console.log(todo)
        todo.todo.forEach((item,index) => {
            missions.push({
                content: item.content,
                estarto: item.solar+" "+item.currentDate+":00",
                time: item.time,
            });
        });
        console.log(missions)
        const data = JSON.stringify({
            title: todo.title,
            content: todo.content,
            missions: missions,
            creator: user.user.id
        });
        var newTodo = await ctx.curl(this.config.api+'?pwd=dhdjnb&action=newTodo&data='+urlencode(Base64.encode(data)),{
            method: 'GET',
            dataType: 'json'
        });
        console.log(newTodo)
        return this.ctx.body = newTodo.data;
    }
}

module.exports = TodoController;
