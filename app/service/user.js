const Service = require('egg').Service;

class UserService extends Service{
    async find(openid) {
        const user = await this.app.mysql.get('users', {openid: openid});
        return {user};
    }
    async create(openid,session_key){
        const result = await this.app.mysql.insert('users', {openid: openid, session_key: session_key});
        console.log(result);
        return result.affectedRows === 1;
    }

}
module.exports = UserService;