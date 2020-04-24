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
        if(result.data.status === 1){
            await Promise.all((result.data.message).all.map(async (item) => {
                if(item.MOTHER === user.user.id){
                    item.MOTHER = "本人";
                }else{
                    const mother_user = await this.app.mysql.get('be_users', {id: item.MOTHER});
                    item.MOTHER = mother_user.nickname;
                }
                for (var i = 0; i < item.SONs.length; i++) { //TODO: 删除这块
                    var son = await this.app.mysql.get('be_users', {id: item.SONs[i]});
                    item.SONs[i] = {
                        uid: item.SONs[i],
                        name: son.nickname,
                        avatar: son.avatar
                    };
                }
            }));

            await Promise.all((result.data.message).t.map(async (item) => {
                if(item.MOTHER === user.user.id){
                    item.MOTHER = "本人";
                }else{
                    const mother_user = await this.app.mysql.get('be_users', {id: item.MOTHER});
                    item.MOTHER = mother_user.nickname;
                }
                for (var i = 0; i < item.SONs.length; i++) {
                    var son = await this.app.mysql.get('be_users', {id: item.SONs[i]});
                    item.SONs[i] = {
                        uid: item.SONs[i],
                        name: son.nickname,
                        avatar: son.avatar
                    };
                }
            }));
            await Promise.all((result.data.message).waitTodo.map(async (item) => {
                if(item.MOTHER === user.user.id){
                    item.MOTHER = "本人";
                }else{
                    const mother_user = await this.app.mysql.get('be_users', {id: item.MOTHER});
                    item.MOTHER = mother_user.nickname;
                }
                for (var i = 0; i < item.SONs.length; i++) {
                    var son = await this.app.mysql.get('be_users', {id: item.SONs[i]});
                    item.SONs[i] = {
                        uid: item.SONs[i],
                        name: son.nickname,
                        avatar: son.avatar
                    };
                }
            }));
            await Promise.all((result.data.message).todo.map(async (item) => {
                if(item.MOTHER === user.user.id){
                    item.MOTHER = "本人";
                }else{
                    const mother_user = await this.app.mysql.get('be_users', {id: item.MOTHER});
                    item.MOTHER = mother_user.nickname;
                }
                for (var i = 0; i < item.SONs.length; i++) {
                    var son = await this.app.mysql.get('be_users', {id: item.SONs[i]});
                    item.SONs[i] = {
                        uid: item.SONs[i],
                        name: son.nickname,
                        avatar: son.avatar
                    };
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
            getTodo.data.message.t.MOTHER = {
                uid: mother_user.id,
                name: mother_user.nickname,
                avatar: mother_user.avatar
            };
            for (var i = 0; i < getTodo.data.message.t.SONs.length; i++) {
                var son = await this.app.mysql.get('be_users', {id: getTodo.data.message.t.SONs[i]});
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

    async test(){
        const { ctx } = this;
               /* const data = JSON.stringify({
                    title: "伟哥测试2",
                    content: "王健懿写BUG一流",
                    missions: [
                        {
                            content: "BUGDHDJ",
                            estarto: "2020-04-24 20:00:00",
                            end: "2020-04-24 21:00:00"
                        }
                    ],
                    creator: 1
                });
                var newTodo = await ctx.curl(this.config.api+'?pwd=dhdjnb&action=newTodo&data='+urlencode(Base64.encode(data)),{
                    method: 'GET',
                    dataType: 'json'
                });
                return this.ctx.body = {
                    status: newTodo.status,
                    headers: newTodo.headers,
                    package: newTodo.data.message
                };*/
        const data = JSON.stringify({
            uid: 2,
            tid: 8
        });
        var newTodo = await ctx.curl(this.config.api+'?pwd=dhdjnb&action=sonJoin&data='+urlencode(Base64.encode(data)),{
            method: 'GET',
            dataType: 'json'
        });
        return this.ctx.body = {
            status: newTodo.status,
            headers: newTodo.headers,
            package: newTodo.data.message
        };
    }


}

module.exports = TodoController;
