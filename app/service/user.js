const Service = require('egg').Service;

class UserService extends Service{
    async find(openid) {
        const user = await this.app.mysql.get('be_users', {openid: openid});
        return {user};
    }
    async create(openid,session_key){
        const result = await this.app.mysql.insert('be_users', {openid: openid, session_key: session_key});
        console.log(result);
        return result.affectedRows === 1;
    }
    async update_session(id,session_key){
        const row = {
            session_key: session_key
        };
        const options = {
            where: {
                id: id
            }
        };
        const result = await this.app.mysql.update('be_users', row, options);
        return result.affectedRows === 1;
    }
}
module.exports = UserService;