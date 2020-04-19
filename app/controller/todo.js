'use strict';

const JWT = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

const Controller = require('egg').Controller;

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
        const todo = await this.ctx.service.todo.aboutUser(user.user.id);
        this.ctx.logger.debug(todo);
        return this.ctx.body = {
            "success": true,
            "data": todo
        };
    }
}

module.exports = TodoController;
