module.exports = {
  // 数据库连接
  connection: "mongodb://127.0.0.1:27017/puppeteer",

  // 爬虫服务
  crawlerServer: {
    live: {
      // 是否显示chrome可视化窗口
      isHeadless: true,
      // 目标一级页面
      url: "https://wqs.jd.com/pglive/index.html",
      // 间隔频率
      frequency: "*/30 * * * * *",
    },
  },

  // 懒加载配置
  lazyLoad: {
    distance: 1000, //单次滚动距离（像素）
    frequency: 200, //滚动频率（毫秒）
    retry: 2, //重试校准次数
  },
};