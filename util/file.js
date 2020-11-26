const fs = require("fs");

module.exports = {
  writeFile(path, buffer, callback) {
    let lastPath = path.substring(0, path.lastIndexOf("/"));
    fs.mkdir(lastPath, { recursive: true }, (err) => {
      if (err) return callback(err);
      fs.writeFile(path, buffer, (err) => {
        if (err) return callback(err);
        return callback(null);
      });
    });
  },
};
