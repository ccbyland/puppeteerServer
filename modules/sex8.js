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
const dataArray = [];
let currentListPageUrl = url;
let pageIndex = 1;
/**
 * 创建浏览器和页面对象环境
 */
async function getAmbient() {
  const _start_time = Date.now();
  log(`==创建浏览器和页面对象环境== Start...`);
  const browser = await puppeteer.launch({
    devtools: false, //是否显示调试工具
    headless: !isHeadless, // 是否显示chrome可视化窗口
    defaultViewport: {
      width: 2000,
      height: 800,
    },
  });
  const page = await browser.newPage();
  await page.goto(currentListPageUrl, {
    timeout: 0
  });
  log(`==创建浏览器和页面对象环境== End... 耗时：${(Date.now() - _start_time) / 1000}秒`);
  return {
    browser,
    page
  };
}
/**
 * 登陆
 * @param {*} page 
 */
async function login(page) {
  const _start_time = Date.now();
  log(`==准备登陆== Start...`);
  //登录
  await closePopup(page);
  await page.type('#ls_username', "cc_byland");
  await page.type('#ls_password', 'byland99');
  await closePopup(page);
  await page.click('.fastlg_l button');
  await page.waitForNavigation();
  log(`==登陆成功== End... 耗时：${(Date.now() - _start_time) / 1000}秒`);
}
async function closePopup(page){
  const content = await page.content();
  const $ = cheerio.load(content);
  const close_index = await $("a.close_index");
  if(close_index.length){
    await page.click('a.close_index');
  }
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
  const list = await $("#threadlist").find("tbody");
  const _list = [];
  list.map((index, item) => {
    let $item = $(item);
    let title = $item.find("a.xst");
    let text = title.text();
    let href = 'https://www.sex8.cc/' + title.attr("href");
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
  // 详情数据
  await getDataByDetail(page, _list);
}
/**
 * 获取数据详情
 * @param {*} page
 * @param {*} list
 */
async function getDataByDetail(page, list) {
  const _start_time = Date.now();
  log(`==获取数据详情== Start...`);
  let i = 0;
  const _array = [];
  while (i < list.length) {
    const obj = list[i];
    log(`---------详情【${obj.text}】读取中---------`);
    await page.goto(`${obj.href}`, {
      timeout: 0
    });
    const content = await page.content();
    const $ = cheerio.load(content);
    const text = await $('#thread_subject').text();
    // const imgs = await $(".pcb").find('img.zoom');
    const zhongzi = await $(".pcb").find("ignore_js_op").find('a');
    i++;
    _array.push({
      'text': text,
      'page': obj.href,
      'url': 'https://www.sex8.cc/' + zhongzi.attr('href'),
    });
    // await new Promise((resolve) => {
    //   downloadImage('https://www.sex8.cc/' + zhongzi.attr('href'), path.join(__dirname, `../data/sex8/${text.trim()}/${zhongzi.text().trim()}`), () => {
    //     resolve();
    //   });
    // });
    // for (let i = 0; i < imgs.length; i++) {
    //   const item = imgs[i];
    //   let imgPatch = autoCheckUrl($(item).attr('src'));
    //   await new Promise((resolve) => {
    //     downloadImage(imgPatch, path.join(__dirname, `../data/sex8/${text.trim()}/cover_${index++}${path.extname(imgPatch)}`), () => {
    //       resolve();
    //     });
    //   });
    // }
  }
  if (_array.length) {
    dataArray.concat(_array);
    // JSON文件写入
    await new Promise((resolve) => {
      writeFile(path.join(__dirname, `../data/${pageIndex}.txt`), JSON.stringify(_array), (err) => {
        log(`---------JSON文件 写入${err ? "失败" : "成功"}---------`);
        resolve();
      });
    });
  }
  log(`==获取数据详情== End... 耗时：${(Date.now() - _start_time) / 1000}秒`);
  getNextPage(page);
}
/**
 * 加载下一页
 */
async function getNextPage(page) {
  console.error(`【开始加载  ${pageIndex}  页】`);
  await page.goto(`https://www.sex8.cc/forum-70-${pageIndex++}.html`, {
    timeout: 0
  });
  await getDataList(page);
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
  // 登陆
  await login(page);
  // 获取数据
  await getNextPage(page);
  // await getDataList(page);
  // // 7：关闭浏览器
  // browser.close();
  // // 8：关闭子进程
  // process.stdout.write("close");
})();