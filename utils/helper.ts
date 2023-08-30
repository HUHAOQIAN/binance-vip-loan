import { BinanceAccountInfo } from "./signature";
import dotenv from "dotenv";
dotenv.config();
export const BinanceAccount: BinanceAccountInfo = {
  apiKey: process.env.API_KEY_BINANCE!,
  secretKey: process.env.SECRET_KEY_BINANCE!,
};
