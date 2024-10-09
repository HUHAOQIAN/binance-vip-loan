import { BinanceAccountInfo, binanceRequest } from "../utils/signature";
import { BinanceAccount } from "../utils/helper";
import { getTicker } from "../utils/all-functions";
export async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
type BinanceLoanRequest = {
  loanCoin: string;
  loanAmount: string;
  collateralCoin: string;
  timestamp: string;
  loanTerm: string;
};

type IRequest = {
  loanAccountId: string;
  loanCoin: string;
  loanAmount: string;
  collateralAccountId: string;
  collateralCoin: string;
  isFlexibleRate: string;
  timestamp: string;
  [key: string]: string; // 添加这一行
};
export async function binanceLoanBorrow(
  account: BinanceAccountInfo,
  loanCoin: string,
  loanAmount: string,
  collateralCoin: string,
  loanTerm: string
) {
  const endpointPath = "/sapi/v1/loan/borrow";
  const method = "POST";
  const timestamp = Date.now().toString();
  const requestBody: BinanceLoanRequest = {
    loanCoin: loanCoin,
    loanAmount: loanAmount,
    collateralCoin: collateralCoin,
    timestamp: timestamp,
    loanTerm: loanTerm,
  };
  if (loanTerm !== undefined) {
    requestBody.loanTerm = loanTerm;
  }
  const params = new URLSearchParams(requestBody);
  const res = await binanceRequest(account, endpointPath, method, null, params);
  console.log(res);
}

export async function binanceVipLoanBorrow(
  account: BinanceAccountInfo,
  loanAccountId: string,
  loanCoin: string,
  loanAmount: string,
  collateralAccountId: string,
  collateralCoin: string,
  isFlexibleRate: boolean,
  loanTerm?: string
) {
  const endpointPath = "/sapi/v1/loan/vip/borrow";
  const method = "POST";
  const timestamp = Date.now().toString();
  const requestBody: IRequest = {
    loanAccountId: loanAccountId,
    loanCoin: loanCoin,
    loanAmount: loanAmount,
    collateralAccountId: collateralAccountId,
    collateralCoin: collateralCoin,
    isFlexibleRate: isFlexibleRate.toString(),
    timestamp: timestamp,
  };
  if (loanTerm !== undefined) {
    requestBody.loanTerm = loanTerm;
  }
  const params = new URLSearchParams(requestBody);
  const res = await binanceRequest(account, endpointPath, method, null, params);
  return res;
}

export async function getOngoingOrders(account: BinanceAccountInfo) {
  const endpointPath = "/sapi/v1/loan/vip/ongoing/orders";
  const queryString = `timestamp=${Date.now()}`;
  const res = await binanceRequest(
    account,
    endpointPath,
    "GET",
    queryString,
    null
  );
  return res.rows;
}

export async function repayVipLoan(
  account: BinanceAccountInfo,
  orderId: string,
  amount: string
) {
  const endpointPath = "/sapi/v1/loan/vip/repay";
  const method = "POST";
  const timestamp = Date.now().toString();
  const requestBody = {
    orderId: orderId,
    amount: amount,
    timestamp: timestamp,
  };
  const params = new URLSearchParams(requestBody);
  const res = await binanceRequest(account, endpointPath, method, null, params);
  console.log(res);
}
export async function getVipLoanable(
  account: BinanceAccountInfo,
  loanCoin: string
) {
  const endpointPath = "/sapi/v1/loan/vip/loanable/data";
  const queryString = `loanCoin=${loanCoin}&timestamp=${Date.now()}`;
  const res = await binanceRequest(
    account,
    endpointPath,
    "GET",
    queryString,
    null
  );
  console.log(res);
}

export async function vipLoanRequestData(
  account: BinanceAccountInfo,
  loanAccountId: string
) {
  const endpointPath = "/sapi/v1/loan/vip/request/data";
  const queryString = `timestamp=${Date.now()}`;
  const res = await binanceRequest(
    account,
    endpointPath,
    "GET",
    queryString,
    null
  );
  const requestData = res.rows.find(
    (item: any) => item.loanAccountId === loanAccountId
  );
  // if (requestData.status === "Pendding") {
  //   await sleep(10000);
  //   console.log(` vip loan 状态为 ${requestData.status}`);
  //   await vipLoanRequestData(account, loanAccountId);
  // } else
  if (requestData.status === "Failed") {
    console.log(`vip loan 状态为 ${requestData.status}`);
    return false;
  } else {
    console.log(`vip loan 状态为 ${requestData.status}`);
    return true;
  }
}

export async function vipLoanAll(
  account: BinanceAccountInfo,
  loanCoin: string,
  loanAmount: string,
  collateralCoin: string,
  isFlexibleRate: boolean,
  uid: string,
  loanTerm?: string
) {
  try {
    const loan = await binanceVipLoanBorrow(
      account,
      uid,
      loanCoin,
      loanAmount,
      uid,
      collateralCoin,
      isFlexibleRate,
      loanTerm
    );
    console.log(`loan id: ${loan.loanAccountId}`);
    const loanAccountId = loan.loanAccountId;
    const requestStatus = await vipLoanRequestData(account, loanAccountId);
    return requestStatus;
  } catch (e) {
    console.error(e);
  }
  //   await Promise.all([flexible, flexible30, flexible60, stable30, stable60]);
}

export async function vipLoanAllTerm(
  account: BinanceAccountInfo,
  borrowCoin: string,
  borrowAmountUSDT: string,
  collateralCoin: string,
  uid: string
) {
  try {
    const price = await getTicker(borrowCoin + "USDT");
    const borrowAmount = (Number(borrowAmountUSDT) / price).toFixed(2);
    const loans = [
      vipLoanAll(account, borrowCoin, borrowAmount, collateralCoin, true, uid),
      vipLoanAll(
        account,
        borrowCoin,
        borrowAmount,
        collateralCoin,
        true,
        uid,
        "30"
      ),
      vipLoanAll(
        account,
        borrowCoin,
        borrowAmount,
        collateralCoin,
        true,
        uid,
        "60"
      ),
      vipLoanAll(
        account,
        borrowCoin,
        borrowAmount,
        collateralCoin,
        false,
        uid,
        "30"
      ),
      vipLoanAll(
        account,
        borrowCoin,
        borrowAmount,
        collateralCoin,
        false,
        uid,
        "60"
      ),
    ];

    await promiseAny(
      loans.map((loan) =>
        loan.then((result) => {
          if (result) {
            return true;
          }
          throw new Error("Loan not successful");
        })
      )
    );
  } catch (e) {
    console.error(e);
  }
}

function promiseAny<T>(promises: Promise<T>[]): Promise<T> {
  return new Promise((resolve, reject) => {
    let rejections = 0;
    const errors: any[] = [];
    promises.forEach((promise, index) => {
      promise.then(resolve).catch((error) => {
        errors[index] = error;
        rejections += 1;
        if (rejections === promises.length) {
          reject({ errors, message: "All promises were rejected" });
        }
      });
    });
  });
}
