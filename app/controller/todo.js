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
                if(item.SONS === undefined) {
                }else {
                    console.log("233")
                    for (var i = 0; i < item.SONS.length; i++) {
                        var userdata = await this.app.mysql.get('be_users', {id: tem.SONS[i]});
                        item.SONS[i] = {
                            uid: tem.SONS[i],
                            name: userdata.nickname
                        }
                    }
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
    async test(){
        const { ctx } = this;
        /*        const data = JSON.stringify({
                    title: "ZZMSB 尚未开始测试",
                    content: "ZZMSB",
                    missions: [
                        {
                            content: "zzm不出货1",
                            estarto: "2020-04-24 20:00:00",
                            end: "2020-04-24 21:00:00"
                        },
                        {
                            content: "zzm♂ZPH",
                            estarto: "2020-04-24 20:00:00",
                            end: "2020-04-24 23:00:00"
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
            tid: 6
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
