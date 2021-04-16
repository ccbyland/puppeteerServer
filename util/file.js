const fs = require("fs");
const path = require("path");
const request = require("request");

module.exports = {
  writeFile(path, buffer, callback) {
    fs.writeFile(path, buffer, (err) => {
      if (err) return callback(err);
      return callback(null);
    });
  },
  /**
   * 下载单张图片
   * @param {*} src 网络地址
   * @param {*} dest 本地地址
   * @param {*} callback 
   */
  downloadImage(src, dest, callback) {
    if (!fs.existsSync(dest)) {
      mkdirSync(dest);
    }
    request.head(src, (err, res, body) => {
      if (err) {
        console.log(err);
        return
      }
      src && request(src).pipe(fs.createWriteStream(dest)).on('close', () => {
        callback && callback(null, dest)
      });
    });
  }
};

//递归创建目录 同步方法  
function mkdirSync(dirname) {
  //console.log(dirname);  
  if (fs.existsSync(dirname)) {
    return true;
  } else {
    if (mkdirSync(path.dirname(dirname))) {
      fs.mkdirSync(dirname);
      return true;
    }
  }
}