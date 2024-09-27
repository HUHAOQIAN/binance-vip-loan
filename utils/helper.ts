import { BinanceAccountInfo } from "./signature";
import dotenv from "dotenv";
dotenv.config();
export const BinanceAccount: BinanceAccountInfo = {
  apiKey: process.env.API_KEY_BINANCE!,
  secretKey: process.env.SECRET_KEY_BINANCE!,
};

import axios from "axios";
export class DingDingBot {
  private webhook: string;

  constructor(webhook: string) {
    this.webhook = webhook;
  }

  async sendTextMessage(content: string): Promise<void> {
    const payload = {
      msgtype: "text",
      text: {
        content,
      },
    };

    try {
      const response = await axios.post(this.webhook, payload);
      if (response.data.errcode === 0) {
        console.log("Message sent successfully.");
      } else {
        console.error("Error sending message: ", response.data);
      }
    } catch (error: any) {
      console.error("Error sending message: ", error.message);
    }
  }
}

const dingdingToken = process.env.DINGDING_TOKEN;
export const dingding = new DingDingBot(
  `https://oapi.dingtalk.com/robot/send?access_token=${dingdingToken}`
);
export function dingdingWithTimes(message: string, times: number) {
  let count = 0;
  const intervalId = setInterval(() => {
    dingding.sendTextMessage(`new message ${message}`);
    count++;
    if (count >= times) {
      clearInterval(intervalId);
    }
  }, 10000);
}
export async function sleep(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
