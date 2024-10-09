import {
  binanceLoanBorrow,
  binanceVipLoanBorrow,
  getVipLoanable,
  sleep,
  vipLoanRequestData,
  vipLoanAll,
  vipLoanAllTerm,
} from "./vip-loan-borrow";
import { BINANCE_API_SECRET } from "../utils/helper";
import { getTicker } from "../utils/all-functions";
import { BinanceAccountInfo } from "../utils/signature";

async function attemptVipLoanAllTerm(
  account: BinanceAccountInfo,
  borrowCoin: string,
  borrowAmountUSDT: string,
  collateralCoin: string,
  uid: string
) {
  let success = false;

  while (!success) {
    try {
      await vipLoanAllTerm(
        account,
        borrowCoin,
        borrowAmountUSDT,
        collateralCoin,
        uid
      );
      success = true;
      console.log("成功借到贷款！");
    } catch (e) {
      console.log("借贷失败，重试中...");
      // 这里可以添加一个延迟以避免过于频繁的请求
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
}

// 调用示例

const account = BINANCE_API_SECRET;
const uid = ""; // 修改为自己的uid
const borrowCoin = "GOE"; //修改 借币种
const borrowAmountUSDT = "19000"; //修改 借多少usdt 的币
const collateralCoin = "TUSD"; //修改 抵押币种  多币种  逗号隔开  "TUSD,BUSD,USDT"
attemptVipLoanAllTerm(
  account,
  borrowCoin,
  borrowAmountUSDT,
  collateralCoin,
  uid
);
