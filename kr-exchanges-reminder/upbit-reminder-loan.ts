import { promises } from "dns";
import {
  BINANCE_API_SECRET,
  dingding,
  dingdingWithTimes,
} from "../utils/helper";
import { BinanceAccountInfo } from "../utils/signature";
import { borrwoWithUsdt } from "../loan/margin-borrow-repay";
import { binanceVipLoanBorrow, vipLoanAllTerm } from "../loan/vip-loan-borrow";
import axios from "axios";
import randomUseragent from "random-useragent";
import { SocksProxyAgent } from "socks-proxy-agent";
import fs from "fs";
// 保存已处理的币种到文件
// 保存已处理的币种到文件
import path from "path";
const filePath = path.join(__dirname, "upbit-listed-coins.json");

// const filePath =
//   "/home/ubuntu/exchanges-ts/binance-github/kr-exchanges-reminder/upbit-listed-coins.json";
// 保存已处理的币种到文件
function saveProcessedCoins(coin: string) {
  const data = {
    coin,
    timestamp: Date.now(),
  };

  try {
    // 读取现有数据
    let existingData = [];
    try {
      const fileContent = fs.readFileSync(filePath, "utf-8");
      existingData = JSON.parse(fileContent);
    } catch (error) {
      // 文件不存在或为空,使用空数组
    }
    // 检查是否已存在相同币种
    const coinExists = existingData.some((record) => record.coin === coin);
    if (coinExists) {
      console.log(`币种 ${coin} 已存在,跳过保存`);
      return;
    }
    // 添加新数据
    existingData.push(data);

    // 写回文件
    fs.writeFileSync(filePath, JSON.stringify(existingData, null, 2));
    console.log(`币种 ${coin} 已保存到文件`);
  } catch (error) {
    console.error("保存处理记录失败:", error);
  }
}

// 从文件加载已处理的币种
function loadProcessedCoins() {
  try {
    const data = fs.readFileSync(filePath, "utf-8");
    const records = JSON.parse(data);

    // 转换为 Set
    processedCoins = new Set(records.map((record) => record.coin));
    console.log("已加载处理记录:", Array.from(processedCoins));
  } catch (error) {
    console.log("未找到处理记录文件,创建新的记录");
    processedCoins = new Set();
  }
}
// 保存上次检查的最新公告ID
let lastAnnouncementId: any = null;
// 保存代理列表
let proxies: string[] = [];
let processedCoins = new Set();
// 获取代理列表的函数
async function fetchProxies() {
  const url =
    "http://list.sky-ip.net/user_get_ip_list?token=SGT8KGdJqt18WMXB1677337793961&type=datacenter&qty=500&country=&time=10&format=json&protocol=socks5";
  try {
    const response = await axios.get(url);
    proxies = response.data.data;
    // console.log("代理列表已更新:", proxies);
    return proxies;
  } catch (error) {
    console.error("获取代理时出错:", error);
  }
}

// 获取随机代理
function getRandomProxy(proxies: string[]) {
  const randomIndex = Math.floor(Math.random() * proxies.length);
  // console.log("Random index:", randomIndex);
  return proxies[randomIndex];
}
// 定义检查公告更新的函数
async function checkForUpdates(
  account: BinanceAccountInfo,
  amountUSDTMarginBorrow: number,
  uid: string,
  collateralCoin: string,
  amountUSDTvipBorrow: number
) {
  try {
    const userAgent = randomUseragent.getRandom();
    // console.log(userAgent);
    const proxy = getRandomProxy(proxies);
    // console.log("Using proxy:", proxy);
    const agent = new SocksProxyAgent(`socks5://${proxy}`);
    // 定义请求URL和请求头
    const url =
      "https://api-manager.upbit.com/api/v1/announcements?os=web&page=1&per_page=20&category=trade";
    const headers = {
      "User-Agent": userAgent,
      "Content-Type": "application/json",
      Accept: "application/json",
    };

    const response = await axios.get(url, {
      headers,
      httpAgent: agent,
      httpsAgent: agent,
    });
    const announcements = response.data.data.notices;

    if (announcements.length === 0) {
      console.log("No announcements found.");
      return;
    }

    const latestAnnouncement = announcements[0];

    if (lastAnnouncementId === null) {
      // 初次运行时，保存最新公告ID
      console.log("New announcement found:", latestAnnouncement);
      dingding.sendTextMessage(latestAnnouncement.title);
      lastAnnouncementId = latestAnnouncement.id;
      console.log("Initial load. Latest announcement ID:", lastAnnouncementId);
      const title = latestAnnouncement.title;
      const match = title.match(/\(([^)]+)\)/);
      if (match) {
        const coin = match[1];
        // await borrwoWithUsdt(account, "EOS", 5); //测试
        // console.log(`Newly listed coin in the latest announcement: ${coin}`);
        processedCoins.add(coin);
        saveProcessedCoins(coin);
        console.log(`Initial coin ${coin} added to processed list`);
      } else {
        console.log("No coin found in the latest announcement title.");
      }
    } else if (latestAnnouncement.id !== lastAnnouncementId) {
      // 如果最新公告ID与上次检查时不同，则表示有新公告

      lastAnnouncementId = latestAnnouncement.id;

      // 提取最新公告标题中的币种字段
      const title = latestAnnouncement.title;
      const match = title.match(/\(([^)]+)\)/);
      if (match) {
        const coin = match[1];
        if (!processedCoins.has(coin)) {
          dingding.sendTextMessage(
            `${latestAnnouncement.title} -- ${new Date().toLocaleString()}`
          );
          console.log("New announcement found:", latestAnnouncement);
          console.log(
            `Processing new coin: ${coin} at ${new Date().toLocaleString()}`
          );
          try {
            const results = await Promise.allSettled([
              borrwoWithUsdt(account, coin, amountUSDTMarginBorrow),
              vipLoanAllTerm(
                account,
                coin,
                amountUSDTvipBorrow.toString(),
                collateralCoin,
                uid
              ),
            ]);

            // 检查每个借币操作的结果
            results.forEach((result, index) => {
              const borrowType = index === 0 ? "杠杠" : "viploan";
              if (result.status === "fulfilled") {
                dingding.sendTextMessage(`${coin} ${borrowType} 借币成功}`);
              } else {
                console.error(`${coin} ${borrowType}借币失败:`, result.reason);
                dingding.sendTextMessage(
                  `${coin} ${borrowType} 借币失败} ${result.reason.message}`
                );
              }
            });

            // 处理完成后添加到已处理集合
            processedCoins.add(coin);
            console.log(`${coin} 处理完成，已添加到已处理列表`);
            saveProcessedCoins(coin);
          } catch (error) {
            console.error(`处理 ${coin} 时发生错误:`, error);
            dingding.sendTextMessage(
              `处理 ${coin} 时发生错误: ${error.message}`
            );
          }
        } else {
          console.log(`${coin} 已经处理过，跳过`);
        }
      }
    } else {
      console.log("No new announcements.", new Date().toLocaleString());
    }
  } catch (error) {
    console.error("Error fetching announcements:", error.message);
  }
}

// 初始化代理并设置定期刷新
loadProcessedCoins();
fetchProxies();
setInterval(fetchProxies, 6 * 60 * 1000); // 每10分钟刷新一次

// 定时检查公告更新
const account = BINANCE_API_SECRET;
const uid = "122974375"; // 修改为自己的uid
const amountUSDTMarginBorrow = 100000;
const borrowAmountUSDTViploan = 200000; //修改 借多少usdt 的币
const collateralCoin = "FDUSD,BTC,ETH";

setInterval(
  () =>
    checkForUpdates(
      account,
      amountUSDTMarginBorrow,
      uid,
      collateralCoin,
      borrowAmountUSDTViploan
    ),
  1000
);
// checkForUpdates(account, 100, uid, "TUSD", 1000);
