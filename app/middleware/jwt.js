const JWT = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

module.exports = (options, app) => {
    return async function userInterceptor(ctx, next) {
        var authToken = ctx.header.authorization;
        if (!authToken) {
            return ctx.body = {
                success: false,
                message: "未登录"
            };
        }
        var user = JWT.verify(authToken, fs.readFileSync(path.resolve(__dirname, '../jwt_pub.pem')));
        if (!user) {
            return ctx.body = {
                success: false,
                message: "用户信息已过期"
            };
        }
        await next();
    }
};