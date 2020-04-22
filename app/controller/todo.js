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
            result.data.message.t.forEach((item,index) => {
                if(item.MOTHER === user.user.id){
                    item.MOTHER = "本人";
                }else{
                    const mother_user = this.ctx.service.user.selectUser(item.MOTHER);
                    item.MOTHER = mother_user.user.nickName;
                }
            });
            return this.ctx.body = result.data;
        }else{
            this.ctx.status = 500;
            return this.ctx.body = {
                success: false,
                message: "内部错误"
            };
        }
    }

    async test(){
        const { ctx } = this;
        const data = JSON.stringify({
            title: "YWJ",
            content: "殷伟杰每日必备任务",
            missions: [
                {
                    content: "周二殷伟杰女装",
                    end: "1587468616",
                    estarto: "1587468616"
                },
                {
                    content: "周三殷伟杰女装",
                    end: "1587555016",
                    estarto: "1587468616"
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
        };
    }
}

module.exports = TodoController;
