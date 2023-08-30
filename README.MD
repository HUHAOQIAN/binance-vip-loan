### 修改借贷参数

const borrowCoin = "BLZ"; //修改 借币种
const borrowAmount = "450000"; //修改 借币数量
const colleteralCoin = "TUSD"; //修改 抵押币种 多币种 逗号隔开 "TUSD,BUSD,USDT"

### 运行借贷程序

ts-node loan/run-vip-loan.ts

## 还款全部币种

ts-node loan/repay-borrow.ts
