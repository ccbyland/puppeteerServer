const child_process = require("child_process");
const cronJob = require("cron").CronJob;
const path = require("path");
const config = require("./config");
const uLog = require("./util/log.js");
const { frequency } = config.crawlerServer.live;

let i = 0;
let free = null;
function run() {
  if (free) {
    return;
  }

  free = child_process.exec(`node ${[path.resolve(__dirname, "task.js")]}`);
  uLog.info(`子进程PID：${free.pid}已启动，开始执行第${++i}次定时任务...`);

  free.stdout.on("data", (data) => {
    if (data == "close") {
      child_process.exec(`kill -9 ${free.pid}`);
      return;
    }
    console.log(data);
  });

  free.stderr.on("data", (data) => {
    console.error("===free.stderr===", data);
  });

  free.on("close", () => {
    uLog.info(`子进程PID：${free.pid}已退出！`);
    free = null;
  });
}

/**
 * cronTime [必需] 配置定时任务的时间，可以使用这可以是cron语法或JS Date对象的形式。
 * onTick [必需]在指定时间触发的回调。
 * onComplete [可选] 在作业停止时将触发的回调。
 * Start [可选]指定是否在退出构造函数之前启动作业，默认情况下，此值设置为false。
 * timeZone [可选] -指定执行的时区。这将修改相对于您的时区的实际时间 ，不设置为当前所在时区。设置为Europe/London 为UTC 0时区
 */
new cronJob(frequency, run, null, true);
run();
