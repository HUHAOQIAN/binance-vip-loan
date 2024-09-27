import axios from "axios";
import crypto from "crypto";
import { SocksProxyAgent } from "socks-proxy-agent";

export type HeadersBinance = {
  "X-MBX-APIKEY": string; // 把你的 API 密钥放在 'X-MBX-APIKEY' 头中
};
export type BinanceAccountInfo = {
  mail?: string;
  apiKey: string;
  secretKey: string;
};
export function createSignature(
  queryString: string,
  secretKey: string
): string {
  return crypto
    .createHmac("sha256", secretKey)
    .update(queryString)
    .digest("hex");
}
type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

export async function binanceRequest(
  { apiKey, secretKey }: BinanceAccountInfo,
  endpointPath: string,
  method: HttpMethod,
  queryString: string | null,
  requestBody: URLSearchParams | null,
  proxy?: SocksProxyAgent,
  marketType: "spot" | "future" = "spot" // 默认为 spot
) {
  const headers: HeadersBinance = {
    "X-MBX-APIKEY": apiKey,
  };
  const baseURL =
    marketType === "spot"
      ? "https://api4.binance.com"
      : "https://fapi.binance.com";
  // const baseURL = "https://api4.binance.com";
  let url = `${baseURL}${endpointPath}`;
  let signature;
  if (queryString) {
    signature = createSignature(queryString, secretKey);
    url += "?" + queryString;
    if (signature) {
      url += "&signature=" + signature;
    }
  } else if (requestBody) {
    signature = createSignature(requestBody.toString(), secretKey);
    requestBody.append("signature", signature);
  }
  try {
    const res = await axios.request({
      url,
      method,
      headers,
      params: requestBody || undefined,
      httpAgent: proxy,
      httpsAgent: proxy,
    });
    // if (res.status !== 200 || res.data.code !== "0") {
    //   throw new Error(res.data.msg);
    // }
    return res.data;
  } catch (error: any) {
    if (error.response) {
      console.error("Server responded with an error:", error.response.data);
    } else if (error.request) {
      console.error(
        "Request was made but no response received:",
        error.request
      );
    } else {
      console.error("Error:", error.message);
    }
    throw new Error(`Request failed: ${error.message}`);
  }
}
