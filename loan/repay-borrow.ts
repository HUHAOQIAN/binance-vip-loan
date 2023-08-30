import { LILEIBinanceAccount } from "../utils/helper";
import {
  binanceLoanBorrow,
  binanceVipLoanBorrow,
  getVipLoanable,
  sleep,
  vipLoanRequestData,
  vipLoanAll,
  repayVipLoan,
  getOngoingOrders,
} from "../utils/vip-loan-borrow";

async function repayAll() {
  const getRepayInfo = await getOngoingOrders(LILEIBinanceAccount);
  console.log(getRepayInfo);
  getRepayInfo.forEach(async (item: any) => {
    const orderId = item.orderId;
    const totalDebt = item.totalDebt;
    await repayVipLoan(LILEIBinanceAccount, orderId, totalDebt);
  });
  //   await repayVipLoan("USDT");
}
repayAll();
