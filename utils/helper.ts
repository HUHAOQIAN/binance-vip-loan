import { BinanceAccountInfo } from "./signature";
import dotenv from "dotenv";
dotenv.config();
export const LILEIBinanceAccount: BinanceAccountInfo = {
  apiKey: process.env.API_KEY_LILEI_BINANCE!,
  secretKey: process.env.SECRET_KEY_LILEI_BINANCE!,
};
