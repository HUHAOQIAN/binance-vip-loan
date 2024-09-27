import { dingding, sleep } from "../utils/helper";
import { getTicker } from "../utils/all-functions";
import { BinanceAccountInfo, binanceRequest } from "../utils/signature";
export async function marginBorrowRepay(
  account: BinanceAccountInfo,
  coin: string,
  amount: string,
  type: "BORROW" | "REPAY",
  isIsolated: boolean = false
) {
  const endpointPath = "/sapi/v1/margin/borrow-repay";
  const timestamp = Date.now().toString();
  const requestBody: any = {
    asset: coin,
    isIsolated: `${isIsolated}`,
    amount: amount,
    type: type,
    timestamp: timestamp,
  };
  if (isIsolated) {
    requestBody["symbol"] = coin + "USDT";
  }
  const params = new URLSearchParams(requestBody);
  const res = await binanceRequest(account, endpointPath, "POST", null, params);
  console.log(res);
}

export async function borrwoWithUsdt(
  account: BinanceAccountInfo,
  coin: string,
  amountUSDT: number,
  times: number = 300
) {
  let count = 0;
  while (count < times) {
    try {
      const price = await getTicker(coin + "USDT");
      const amountBorrow = (amountUSDT / price).toFixed(2);
      await marginBorrowRepay(account, coin, amountBorrow, "BORROW");
      dingding.sendTextMessage(`借到${amountBorrow}个${coin}`);
      break;
    } catch (e) {
      console.log(e);
      await sleep(300);
      count++;
    }
  }
}
// test();
