import {
  binanceLoanBorrow,
  binanceVipLoanBorrow,
  getVipLoanable,
  sleep,
  vipLoanRequestData,
  vipLoanAll,
} from "../utils/vip-loan-borrow";
import { LILEIBinanceAccount } from "../utils/helper";

const borrowCoin = "BLZ";
const borrowAmount = "450000";
const colleteralCoin = "TUSD";
async function run() {
  let hasBorrowed = false; // 标志来表示是否已经借到
  while (!hasBorrowed) {
    // 只要没有借到就继续
    try {
      const loans = [
        vipLoanAll(borrowCoin, borrowAmount, colleteralCoin, true),
        vipLoanAll(borrowCoin, borrowAmount, colleteralCoin, true, "30"),
        vipLoanAll(borrowCoin, borrowAmount, colleteralCoin, true, "60"),
        vipLoanAll(borrowCoin, borrowAmount, colleteralCoin, false, "30"),
        vipLoanAll(borrowCoin, borrowAmount, colleteralCoin, false, "60"),
      ];
      for (const loan of loans) {
        loan.then((result) => {
          if (result) {
            hasBorrowed = true; // 如果任何一个成功了，设置标志为 true
          }
        });
      }
      await Promise.all(loans);
    } catch (e) {
      console.error(e);
    }
  }
}
run();
