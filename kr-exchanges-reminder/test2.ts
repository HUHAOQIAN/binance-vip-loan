// 模拟发送消息的函数
async function sendMessage() {
  // 模拟一个可能成功或失败的操作
  if (Math.random() > 0.5) {
    return "消息发送成功";
  } else {
    throw new Error("网络错误，发送失败");
  }
}
// 模拟保存文件的函数
async function saveFile() {
  // 模拟一个可能成功或失败的操作
  if (Math.random() > 0.5) {
    return "文件保存成功";
  } else {
    throw new Error("磁盘已满，保存失败");
  }
}
// 使用 Promise.allSettled
async function runTasks() {
  const results = await Promise.allSettled([sendMessage(), saveFile()]);
  results.forEach((result, index) => {
    if (result.status === "fulfilled") {
      // 任务成功
      console.log(`任务${index + 1}成功:`, result.value);
    } else {
      // 任务失败
      console.log(`任务${index + 1}失败:`, result.reason);
    }
  });
}
// 运行示例
runTasks();
