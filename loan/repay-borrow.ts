import { BINANCE_API_SECRET } from "../utils/helper";
import {
  binanceLoanBorrow,
  binanceVipLoanBorrow,
  getVipLoanable,
  sleep,
  vipLoanRequestData,
  vipLoanAll,
  repayVipLoan,
  getOngoingOrders,
} from "./vip-loan-borrow";

async function repayAll() {
  const getRepayInfo = await getOngoingOrders(BINANCE_API_SECRET);
  console.log(getRepayInfo);
  getRepayInfo.forEach(async (item: any) => {
    const orderId = item.orderId;
    const totalDebt = item.totalDebt;
    await repayVipLoan(BINANCE_API_SECRET, orderId, totalDebt);
  });
  //   await repayVipLoan("USDT");
}
repayAll();
