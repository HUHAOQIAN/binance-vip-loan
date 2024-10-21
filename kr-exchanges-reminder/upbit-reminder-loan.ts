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
// 保存上次检查的最新公告ID
let lastAnnouncementId: any = null;
// 保存代理列表
let proxies: string[] = [];

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
        console.log(`Newly listed coin in the latest announcement: ${coin}`);
      } else {
        console.log("No coin found in the latest announcement title.");
      }
    } else if (latestAnnouncement.id !== lastAnnouncementId) {
      // 如果最新公告ID与上次检查时不同，则表示有新公告
      console.log("New announcement found:", latestAnnouncement);
      lastAnnouncementId = latestAnnouncement.id;
      dingdingWithTimes(
        `${latestAnnouncement.title} -- ${new Date().toLocaleString()}`,
        3
      );
      // 提取最新公告标题中的币种字段
      const title = latestAnnouncement.title;
      const match = title.match(/\(([^)]+)\)/);
      if (match) {
        const coin = match[1];
        console.log(
          `Newly listed coin in the latest announcement: ${coin} ${new Date().toLocaleString()}`
        );
        //借贷的逻辑
        // await borrwoWithUsdt(account, coin, amountUSDT);
        await Promise.all([
          borrwoWithUsdt(account, coin, amountUSDTMarginBorrow),
          // vipLoanAllTerm(
          //   account,
          //   coin,
          //   amountUSDTvipBorrow.toString(),
          //   collateralCoin,
          //   uid
          // ),
        ]);
      } else {
        console.log("No coin found in the latest announcement title.");
      }
    } else {
      console.log("No new announcements.", new Date().toLocaleString());
    }
  } catch (error) {
    console.error("Error fetching announcements:", error);
  }
}

// 初始化代理并设置定期刷新
fetchProxies();
setInterval(fetchProxies, 6 * 60 * 1000); // 每10分钟刷新一次

// 定时检查公告更新
const account = BINANCE_API_SECRET;
const uid = "";

setInterval(() => checkForUpdates(account, 30000, uid, "TUSD", 10000), 1000);
// checkForUpdates(account, 100, uid, "TUSD", 1000);
