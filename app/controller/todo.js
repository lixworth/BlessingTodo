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
        var getTodoInWhichExists = await ctx.curl(this.config.api+'?pwd=dhdjnb&action=getTodoInWhichExists&data='+urlencode('{"uid":1}'),{
            dataType: 'json',
            method: 'GET'
        });
        return this.ctx.body = getTodoInWhichExists.data;
    }

    async test(){
        const { ctx } = this;
        const data = JSON.stringify({
            title: "殷伟杰女装",
            content: "殷伟杰每日必备任务",
            missions: [
                {
                    content: "周二殷伟杰女装",
                    end: "1587468616"
                },
                {
                    content: "周三殷伟杰女装",
                    end: "1587555016"
                }
            ],
            creator: 1
        });
        var newTodo = await ctx.curl(this.config.api+'?pwd=dhdjnb&action=newTodo&data='+urlencode(Base64.encode(data)),{
            method: 'GET',
            dataType: 'json'
        });
        return this.ctx.body = newTodo;
    }
}

module.exports = TodoController;
