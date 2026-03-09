module.exports = {
  apps: [
    {
      name: "betting-forum",
      script: "npm",
      args: "start",
      cwd: "/home/ubuntu/bettingforum",
      env: {
        NEXTAUTH_URL: "https://betting.forum",
        NODE_ENV: "production",
        AUTH_TRUST_HOST: "true", // Required when behind Nginx/proxy for OAuth callbacks
      },
    },
  ],
};
