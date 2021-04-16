const puppeteer = require("puppeteer");
const cheerio = require("cheerio");
const path = require("path");
const fs = require("fs");
const config = require("../config");
const {
  downloadImage,
  getNumberByStr,
  getUrlByStr,
  sleep,
  writeFile,
  log,
  autoCheckUrl,
  ua
} = require("../util");
const {
  crawlerServer,
  lazyLoad
} = config;
const {
  filterTags,
  url,
  isHeadless
} = crawlerServer.sex8;
let currentListPageUrl = url;
let pageIndex = 1;
/**
 * 创建浏览器和页面对象环境
 */
async function getAmbient() {
  const _start_time = Date.now();
  log(`==创建浏览器和页面对象环境== Start...`);
  const browser = await puppeteer.launch({
    devtools: true, //是否显示调试工具
    headless: !isHeadless, // 是否显示chrome可视化窗口
    defaultViewport: {
      width: 1500,
      height: 800,
    },
  });
  const page = await browser.newPage();

  await page.goto(currentListPageUrl);
  log(`==创建浏览器和页面对象环境== End... 耗时：${(Date.now() - _start_time) / 1000}秒`);
  return {
    browser,
    page
  };
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
  const list = await $("#post_list").find(".post-item");

  const _list = [];
  list.map((index, item) => {
    let $item = $(item);
    let title = $item.find(".post-item-title");
    let text = title.text();
    let href = title.attr("href");

    const flag = filterTags.find(tag => {
      return text.indexOf(tag) != -1;
    });
    flag && _list.push({
      text,
      href
    });
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
    log(`---------详情【${obj.text}】读取中---------`);
    await page.goto(`${obj.href}`);
    const content = await page.content();
    const $ = cheerio.load(content);
    const text = await $("#cb_post_title_url").text();
    const imgs = await $("#cnblogs_post_body").find('img');

    let index = 0;
    for (let i = 0; i < imgs.length; i++) {
      const item = imgs[i];
      let imgPatch = autoCheckUrl($(item).attr('src'));
      await new Promise((resolve) => {
        downloadImage(imgPatch, path.join(__dirname, `../data/sex8/${text.trim()}/cover_${index++}${path.extname(imgPatch)}`), () => {
          resolve();
        });
      });
    }
    i++;
  }
  log(`==获取数据详情== End... 耗时：${(Date.now() - _start_time) / 1000}秒`);
  getNextPage(page);
  return datalist;
}

/**
 * 加载下一页
 */
async function getNextPage(page){

  await page.goto(currentListPageUrl);
  await Promise.all([
    page.waitForNavigation(),
    page.click(`#pager_top a.p_${++pageIndex}`),
  ]);
  currentListPageUrl = page.url();
  console.error(currentListPageUrl);
}
/**
 * 流程入口
 */
(async function () {
  // 1：创建浏览器和页面对象环境
  const {
    browser,
    page
  } = await getAmbient();
  // 2：获取数据列表
  let dataList = await getDataList(page);
  // 3：整合列表详情数据
  dataList = await getDataByDetail(page, dataList);
  // 7：关闭浏览器
  browser.close();
  // 8：关闭子进程
  process.stdout.write("close");
})();