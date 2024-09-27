import { promises } from "dns";
import { dingding, dingdingWithTimes } from "../utils/helper";
import { BinanceAccountInfo } from "../utils/signature";
import { borrwoWithUsdt } from "../loan/margin-borrow-repay";
import { binanceVipLoanBorrow } from "../loan/vip-loan-borrow";
import axios from "axios";

// 定义请求URL和请求头
const url =
  "https://api-manager.upbit.com/api/v1/announcements?os=web&page=1&per_page=20&category=trade";
const headers = {
  "User-Agent": "Mozilla/5.0",
  "Content-Type": "application/json",
  Accept: "application/json",
};

// 保存上次检查的最新公告ID
let lastAnnouncementId: any = null;

// 定义检查公告更新的函数
async function checkForUpdates(
  account: BinanceAccountInfo,
  amountUSDTMarginBorrow: number,
  uid: string,
  collateralCoin: string,
  amountUSDTvipBorrow: number
) {
  try {
    const response = await axios.get(url, { headers });
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
        await borrwoWithUsdt(account, "EOS", 5); //测试
        console.log(`Newly listed coin in the latest announcement: ${coin}`);
      } else {
        console.log("No coin found in the latest announcement title.");
      }
    } else if (latestAnnouncement.id !== lastAnnouncementId) {
      // 如果最新公告ID与上次检查时不同，则表示有新公告
      console.log("New announcement found:", latestAnnouncement);
      lastAnnouncementId = latestAnnouncement.id;
      dingdingWithTimes(latestAnnouncement.title, 3);
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
          binanceVipLoanBorrow(
            account,
            uid,
            coin,
            amountUSDTvipBorrow.toString(),
            uid,
            collateralCoin,
            true
          ),
        ]);
        // const uid = "122974375";
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

// 定时检查公告更新，每分钟检查一次
import dotenv from "dotenv";
dotenv.config();
const account: BinanceAccountInfo = {
  apiKey: process.env.API_KEY_BINANCE,
  secretKey: process.env.SECRET_KEY_BINANCE,
};

// 参数1：账号信息
// 参数2：借贷金额 usdt
// 参数3：vip借贷 的uid
// 参数4：vip抵押币种
// 参数5：vip借贷金额 usdt

setInterval(
  () => checkForUpdates(account, 30000, "122974375", "TUSD", 10000), //主账号借5wu 的新上upbit 的币
  10000
);

// 初次运行时立即检查一次
checkForUpdates(account, 30000, "122974375", "TUSD", 10000);
