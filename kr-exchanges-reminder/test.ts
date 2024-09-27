import axios from "axios";

const url =
  "https://feed.bithumb.com/_next/data/Kjv4oRBlHkVe9l_fUuIPY/notice.json?category=9&keyword=&page=1";

const headers = {
  authority: "feed.bithumb.com",
  method: "GET",
  path: "/_next/data/Kjv4oRBlHkVe9l_fUuIPY/notice.json?category=9&keyword=&page=1",
  scheme: "https",
  accept: "*/*",
  "accept-encoding": "gzip, deflate, br, zstd",
  "accept-language": "zh-CN,zh;q=0.9",
  //   cookie: "ak_bmsc=...; bm_sv=...;", // 替换为实际的 Cookie
  referer: "https://feed.bithumb.com/",
  "sec-ch-ua":
    '"Chromium";v="128", "Not;A=Brand";v="24", "Google Chrome";v="128"',
  "sec-ch-ua-mobile": "?0",
  "sec-ch-ua-platform": '"Windows"',
  "sec-fetch-dest": "empty",
  "sec-fetch-mode": "cors",
  "sec-fetch-site": "same-origin",
  "user-agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
  "x-nextjs-data": "1",
};

async function fetchNotices() {
  try {
    const response = await axios.get(url, { headers });
    console.log(response.data);
  } catch (error) {
    console.error("Error fetching notices:", error);
  }
}

fetchNotices();
