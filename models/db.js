/**
 * 数据库连接工具类
 * @type {[type]}
 */
const mongoose = require("mongoose");
const fs = require("fs");
const config = require("../config");
const log = require("../util/log.js");

//连接mongodb
mongoose.connect(config.connection, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
mongoose.connection.on("error", (err) => {
  log.error(config.connection + "连接失败... ");
  process.exit(1); //立即退出当前进程
});
mongoose.connection.once("open", () => {
  log.success(config.connection + "连接成功...");
});

// 注册模型
var modelsPath = __dirname + "/mapping/";
fs.readdirSync(modelsPath).forEach((file) => {
  // 载入所有的model
  require(modelsPath + "" + file);
  // 对外提供访问模型接口
  var modelName = file.replace(".js", "");
  exports[modelName] = mongoose.model(modelName);
});
