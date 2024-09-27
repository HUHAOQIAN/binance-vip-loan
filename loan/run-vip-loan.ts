import {
  binanceLoanBorrow,
  binanceVipLoanBorrow,
  getVipLoanable,
  sleep,
  vipLoanRequestData,
  vipLoanAll,
} from "./vip-loan-borrow";
import { BINANCE_API_SECRET } from "../utils/helper";
import { getTicker } from "../utils/all-functions";

async function run() {
  let hasBorrowed = false; // 标志来表示是否已经借到
  const uid = ""; // 修改为自己的uid
  while (!hasBorrowed) {
    // 只要没有借到就继续

    try {
      const price = await getTicker(borrowCoin + "USDT");
      const borrowAmount = (Number(borrowAmountUSDT) / price).toFixed(2);
      const loans = [
        vipLoanAll(borrowCoin, borrowAmount, colleteralCoin, true, uid),
        vipLoanAll(borrowCoin, borrowAmount, colleteralCoin, true, "30", uid),
        vipLoanAll(borrowCoin, borrowAmount, colleteralCoin, true, "60", uid),
        vipLoanAll(borrowCoin, borrowAmount, colleteralCoin, false, "30", uid),
        vipLoanAll(borrowCoin, borrowAmount, colleteralCoin, false, "60", uid),
      ];
      for (const loan of loans) {
        loan.then((result) => {
          if (result) {
            hasBorrowed = true; // 如果任何一个成功了，设置标志为 true
          }
        });
      }
      await Promise.all(loans);
      await sleep(10000);
    } catch (e) {
      console.error(e);
    }
  }
}

const borrowCoin = "GOE"; //修改 借币种
const borrowAmountUSDT = "19000"; //修改 借多少usdt 的币
const colleteralCoin = "TUSD"; //修改 抵押币种  多币种  逗号隔开  "TUSD,BUSD,USDT"
run();
