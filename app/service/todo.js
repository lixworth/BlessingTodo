const Service = require('egg').Service;

class TodoService extends Service{
    //查询和登录用户相关的内容
    async aboutUser(uid,state){
        const todo = await this.app.mysql.select('be_todo', { // 搜索 post 表
            where: { creator: uid, state: state }, // WHERE 条件
            columns: ['author', 'title'], // 要查询的表字段
            orders: [['created_at','desc'], ['id','desc']], // 排序方式
            limit: 10, // 返回数据量
            offset: 0, // 数据偏移量
        });
        const result = await this.app.mysql.get('member', {uid: uid});
        return {
            create: todo,
            about: result
        };
    }






    /*
    * 用 User ID 的方式查询
    * */
    //获取与UID相关的待办
    async getTodoList(){
        const result = await app.mysql.beginTransactionScope(async conn => {
            // don't commit or rollback by yourself
            await conn.insert(table, row1);
            await conn.update(table, row2);
            return { success: true };
        }, this.ctx);
    }
    async selectTodo(uid){
        const todo = await this.app.mysql.get('be_todo', {creator: uid});
        return {todo};
    }
    //被监督人
    async selectRemindsByUser(uid) {
        const todo = await this.app.mysql.get('reminds', {remind: uid});
        return {todo};
    }
    //督促人
    async selectSupersByUser(uid) {
        const todo = await this.app.mysql.get('be_todo', {supervisor: uid});
        return {todo};
    }

    /*
    * 用 Todo ID 的方式查询
    **/
    //被监督人
    async selectRemindsByTodo(tid) {
        const todo = await this.app.mysql.get('reminds', {tid: tid});
        return {todo};
    }
    //督促人
    async selectSupersByTodo(tid) {
        const todo = await this.app.mysql.get('be_todo', {tid: tid});
        return {todo};
    }
}
module.exports = TodoService;