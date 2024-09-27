import { vipLoanAll, binanceVipLoanBorrow } from "./vip-loan-borrow";

const borrowCoin = "JOE"; //修改 借币种
const borrowAmount = "450000"; //修改 借币数量
const colleteralCoin = "TUSD"; //修改 抵押币种  多币种  逗号隔开  "TUSD,BUSD,USDT"
const uid = "";
vipLoanAll(borrowCoin, borrowAmount, colleteralCoin, true, uid);
