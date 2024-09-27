import { BinanceAccountInfo, binanceRequest } from "./signature";

export async function universalTransfer(
  accounts: BinanceAccountInfo,
  type: "MAIN_FUNDING" | "FUNDING_MAIN",
  ccy: string,
  amount: string
) {
  const endpointPath = "/sapi/v1/asset/transfer";
  const method = "POST";
  const timestamp = Date.now().toString();
  const requestBody = {
    type: type,
    asset: ccy,
    amount: amount,
    timestamp: timestamp,
  };
  const params = new URLSearchParams(requestBody);
  const res = await binanceRequest(
    accounts,
    endpointPath,
    method,
    null,
    params
  );
  console.log(res);
  return res;
}

export async function getFundingAsset(
  account: BinanceAccountInfo,
  asset: string
) {
  const endpointPath = "/sapi/v1/asset/get-funding-asset";
  const method = "POST";
  const timestamp = Date.now().toString();
  const requestBody = {
    asset: asset,
    timestamp: timestamp,
  };
  const params = new URLSearchParams(requestBody);
  const res = await binanceRequest(account, endpointPath, method, null, params);
  console.log(res);
  return res;
}

export async function walletBalance(account: BinanceAccountInfo, ccy: string) {
  const endpointPath = "/sapi/v3/asset/getUserAsset";
  const method = "POST";
  const timestamp = Date.now().toString();
  const requestBody = {
    asset: ccy,
    timestamp: timestamp,
  };
  const params = new URLSearchParams(requestBody);
  const res = await binanceRequest(account, endpointPath, method, null, params);
  // console.log(res);
  // console.log(account);
  return { res, account };
}

export async function getTicker(symbol: string) {
  const url = `https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`;
  const res = await fetch(url);
  const data = await res.json();
  return data.price;
}
