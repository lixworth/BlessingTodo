'use strict';

const Controller = require('egg').Controller;

class HomeController extends Controller {
  async index() {
    const { ctx } = this;
    return this.ctx.body = {
      status: 1,
    }
  }

  /**
   *
   * 一言 API
   * 加油 少年！
   * @returns {Promise<void>}
   */
  async yiyan(){
    const { ctx } = this;
    var result = await ctx.curl('https://v1.hitokoto.cn/',{
      method: 'GET',
      dataType: 'json'
    });
    this.ctx.body = result.data;
  }
}

module.exports = HomeController;
