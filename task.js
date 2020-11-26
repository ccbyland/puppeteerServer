const puppeteer = require("puppeteer");
const cheerio = require("cheerio");
const path = require("path");
const fs = require("fs");
const config = require("./config");
const { getNumberByStr, getUrlByStr, sleep, writeFile, log, ua } = require("./util");
const { crawlerServer, lazyLoad } = config;
const { url, isHeadless } = crawlerServer.live;
/**
 * 创建浏览器和页面对象环境
 */
async function getAmbient() {
  const _start_time = Date.now();
  log(`==创建浏览器和页面对象环境== Start...`);
  const browser = await puppeteer.launch({
    // 指定chromium地址
    executablePath: '/Users/jixiaojiao3/codes/puppeteer-test/node_modules/puppeteer/.local-chromium/mac-818858/chrome-mac/Chromium.app/Contents/MacOS/Chromium',
    devtools: true, //是否显示调试工具
    headless: !isHeadless, // 是否显示chrome可视化窗口
    defaultViewport: {
      width: 414,
      height: 736,
      isMobile: true, //是否启用移动端模式
    },
  });
  const page = await browser.newPage();
  await page.setUserAgent(ua['jx-app-ios']);

  await page.goto(url);
  log(`==创建浏览器和页面对象环境== End... 耗时：${(Date.now() - _start_time) / 1000}秒`);
  return { browser, page };
}
/**
 * 懒加载数据加载处理
 * 原理：检测两次相邻的滚动是否存在高度差，考虑接口性能影响，可能滚动后数据并未加载出来，增加重试次数校准
 * @param {*} page
 */
async function autoScroll(page) {
  const _start_time = Date.now();
  log(`==懒加载数据加载处理== Start...`);
  await page.evaluate(async (lazyLoad) => {
    await new Promise((resolve) => {
      var totalHeight = 0;
      var distance = lazyLoad.distance;
      let count = 0;
      var timer = setInterval(() => {
        if (count) {
          console.log(`【---懒加载数据校准重试---】第${count}次`);
        }
        var scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;

        if (totalHeight >= scrollHeight) {
          // 重试
          if (count < lazyLoad.retry) {
            ++count;
          } else {
            clearInterval(timer);
            resolve();
          }
          // 重置
        } else {
          count = 0;
        }
      }, lazyLoad.frequency);
    });
  }, lazyLoad);
  log(`==懒加载数据加载处理== End... 耗时：${(Date.now() - _start_time) / 1000}秒`);
}
/**
 * 全屏截图
 * @param {*} page
 */
async function screenshot(page) {
  const _start_time = Date.now();
  log(`==全屏截图== Start...`);
  fs.mkdirSync("./img", { recursive: true });
  await page.screenshot({
    path: path.join(__dirname, `./img/img_${Date.now()}.jpeg`), //截图保存路径。截图图片类型将从文件扩展名推断出来。如果是相对路径，则从当前路径解析。如果没有指定路径，图片将不会保存到硬盘。
    type: "jpeg", //指定截图类型, 可以是 jpeg 或者 png。默认 'png'
    quality: 100, //图片质量, 可选值 0-100. png 类型不适用。
    fullPage: true, //如果设置为true，则对完整的页面（需要滚动的部分也包含在内）。默认是false
  });
  log(`==全屏截图== End... 耗时：${(Date.now() - _start_time) / 1000}秒`);
}
/**
 * 获取数据列表
 * @param {*} page
 */
async function getDataList(page) {
  const _start_time = Date.now();
  log(`==获取数据列表== Start...`);
  const content = await page.content();
  const $ = cheerio.load(content);
  const list = await $(".liveing").find(".liveing_item");

  const _list = [];
  list.map((index, item) => {
    let $item = $(item);
    let _pageView = $item.find(".live_tag").find(".number").text();
    let _authorPic = $item.find(".live_anchor").find(".live_head").attr("style");

    _list[_list.length] = {
      liveId: $item.attr("data-id"), //直播ID
      indexImage: $item.find(".live_img").find("img").attr("src"), //封面图
      title: $item.find(".liveing_tname").text(), //标题
      desc: $item.find(".liveing_desc").text(), //描述
      pageView: getNumberByStr(_pageView), //观看人数
      authorName: $item.find(".live_anchor").find(".live_aname").text(), //主播名称
      authorPic: getUrlByStr(_authorPic), //主播头像
    };
  });
  log(`---------共拉取直播列表共${_list.length}条数据---------`);
  log(`==获取数据列表== End... 耗时：${(Date.now() - _start_time) / 1000}秒`);
  return _list;
}
/**s
 * 获取数据详情
 * @param {*} page
 * @param {*} datalist
 */
async function getDataByDetail(page, datalist) {
  const _start_time = Date.now();
  log(`==获取数据详情== Start...`);
  let i = 0;
  while (i < datalist.length) {
    const obj = datalist[i];
    log(`---------直播ID${obj.liveId}读取中---------`);
    await page.goto(`https://wqs.jd.com/pglive/detail.html?id=${obj.liveId}`);
    const content = await page.content();
    const $ = cheerio.load(content);
    await sleep(500);
    const goods_num = (await $(".bottom_goods_num").text()) || 0;
    let praise_num = (await $(".bottom_praise_num").text()) || 0;
    if (String(praise_num).indexOf("万") != -1) {
      praise_num = praise_num.replace("万", "") * 10000;
    }
    datalist[i]["goods_num"] = goods_num;
    datalist[i]["praise_num"] = praise_num;
    i++;
  }
  log(`==获取数据详情== End... 耗时：${(Date.now() - _start_time) / 1000}秒`);
  return datalist;
}

/**
 * 存储数据
 * @param {*} dataList
 */
async function savaData(dataList) {
  const _start_time = Date.now();
  log(`==存储数据== Start...`);

  const list = [];
  for (let i = 0, j = dataList.length; i < j; i++) {
    const obj = dataList[i];
    let _now = new Date();
    list[list.length] = {
      live_id: obj.liveId, //直播ID
      index_image: obj.indexImage, //封面图
      title: obj.title, //标题
      desc: obj.desc, //描述
      page_view: obj.pageView, //观看人数
      author_name: obj.authorName, //主播名称
      author_pic: obj.authorPic, //主播头像
      goods_num: obj.goods_num, // 商品数量
      praise_num: obj.praise_num, // 点赞数量
      create_data: _now, //创建日期
      update_data: _now, //更新日期
    };
  }

  // JSON文件写入
  await new Promise((resolve) => {
    writeFile(path.join(__dirname, `./data/${Date.now()}.txt`), JSON.stringify(list), (err) => {
        log(`---------JSON文件 写入${err ? "失败" : "成功"}---------`);
        resolve();
    });
  });

  // Mongodb数据库写入
  await new Promise((resolve) => {
    require("./dao/live").prototype.insertAll(list, ({ result }) => {
        log(`---------Mongodb 写入${result.ok ? "成功" : "失败"}---------`);
        resolve();
    });
  });

  log(`==存储数据== End... 耗时：${(Date.now() - _start_time) / 1000}秒`);
}

/**
 * 流程入口
 */
(async function () {
  // 1：创建浏览器和页面对象环境
  const { browser, page } = await getAmbient();
  // 2：懒加载数据加载处理
  await autoScroll(page);
  // 3：截图
  await screenshot(page);
  // 4：获取数据列表
  let dataList = await getDataList(page);
  // 5：整合列表详情数据
  dataList = await getDataByDetail(page, dataList);
  // 6：存储出数据
  await savaData(dataList);
  // 7：关闭浏览器
  browser.close();
  // 8：关闭子进程
  process.stdout.write("close");
})();
