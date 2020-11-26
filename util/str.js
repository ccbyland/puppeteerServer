module.exports = {
  getUrlByStr(str) {
    if (!str) {
      return "";
    }
    return str.match(
      /(http|ftp|https):\/\/[\w\-_]+(\.[\w\-_]+)+([\w\-\.,@?^=%&amp;:/~\+#]*[\w\-\@?^=%&amp;/~\+#])?/
    )[0];
  },
  getNumberByStr(str) {
    if (!str) {
      return "";
    }
    return str.replace(/[^\d.]/g, "");
  }
};
