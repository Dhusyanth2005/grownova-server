import cron from "node-cron";
import axios from "axios";

const URL = "https://grownova-server.onrender.com/health";

cron.schedule("*/10 * * * *", async () => {
  try {
    const res = await axios.get(URL);
    console.log("Ping success:", res.status);
  } catch (error) {
    console.log("Ping failed:", error.message);
  }
});

console.log("Cron job started");