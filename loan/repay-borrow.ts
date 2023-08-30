import { BinanceAccount } from "../utils/helper";
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
  const getRepayInfo = await getOngoingOrders(BinanceAccount);
  console.log(getRepayInfo);
  getRepayInfo.forEach(async (item: any) => {
    const orderId = item.orderId;
    const totalDebt = item.totalDebt;
    await repayVipLoan(BinanceAccount, orderId, totalDebt);
  });
  //   await repayVipLoan("USDT");
}
repayAll();
