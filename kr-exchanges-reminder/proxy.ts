async function fetchProxies() {
  const url =
    "http://list.sky-ip.net/user_get_ip_list?token=SGT8KGdJqt18WMXB1677337793961&type=datacenter&qty=500&country=&time=10&format=json&protocol=socks5";
  try {
    const response = await axios.get(url);
    proxies = response.data;
    console.log("代理列表已更新:", proxies);
  } catch (error) {
    console.error("获取代理时出错:", error);
  }
}
