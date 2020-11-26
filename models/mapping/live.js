/**
 * 直播Model类
 * @type {[type]}
 */
var mongoose = require("mongoose"),
  Schema = mongoose.Schema;

var schema = new Schema({
  live_id: String, //直播ID
  index_image: String, //封面图
  title: String, //标题
  desc: String, //描述
  page_view: Number, //观看人数
  author_name: String, //主播名称
  author_pic: String,//主播头像
  goods_num: Number,//商品数量
  praise_num: Number,//点赞数量
  create_date: Date, //创建日期
  update_date: Date, //更新日期
});

mongoose.model("live", schema);
