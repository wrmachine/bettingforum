const fs = require("fs");
const path = require("path");

const envPath = path.join(process.cwd(), ".env");
let env = {};
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, "utf8")
    .split(/[\r\n]+/)
    .forEach((line) => {
      const m = line.match(/^([^#=]+)=(.*)$/);
      if (m) env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, "");
    });
}

const url = (env.NEXTAUTH_URL || "http://localhost:3000") + "/api/cron/ai-bots";
const secret = env.CRON_SECRET;
const headers = secret ? { Authorization: "Bearer " + secret } : {};

fetch(url, { headers })
  .then((r) => r.json())
  .then((data) => console.log(JSON.stringify(data, null, 2)))
  .catch((err) => {
    console.error(err.message);
    process.exit(1);
  });
