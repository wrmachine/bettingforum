# Deploy Betting Forum to AWS EC2

## 1. Launch EC2 Instance

1. **EC2 Console** → Launch instance
2. **Name:** `betting-forum`
3. **AMI:** Ubuntu 22.04 LTS
4. **Instance type:** `t2.micro` (free tier) or `t3.small`
5. **Key pair:** Create new or select existing → download `.pem`
6. **Security group:**
   - SSH (22) – your IP
   - HTTP (80) – `0.0.0.0/0`
   - Custom TCP 3000 – `0.0.0.0/0` (optional if using Nginx)

---

## 2. Connect & Install

```bash
# Connect (adjust key and IP)
ssh -i your-key.pem ubuntu@YOUR_EC2_PUBLIC_IP

# System updates
sudo apt update && sudo apt upgrade -y

# Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Git & PM2
sudo apt install git -y
sudo npm install -g pm2
```

---

## 3. Clone & Configure

```bash
# Clone your repo
git clone https://github.com/YOUR_USERNAME/betting-forum.git
cd betting-forum

# Install dependencies
npm install

# Create .env
nano .env
```

**Required `.env` values:**

```env
DATABASE_URL="file:./prisma/production.db"
NEXTAUTH_SECRET="GENERATE_WITH_openssl_rand_base64_32"
NEXTAUTH_URL="https://yourdomain.com"
```

Optional: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `RESEND_API_KEY`, `ANTHROPIC_API_KEY`

---

## 4. Build & Run

```bash
# Prisma
npx prisma generate
npx prisma db push

# Build
npm run build

# Start with PM2
pm2 start npm --name "betting-forum" -- start
pm2 save
pm2 startup
```

Test: `http://YOUR_EC2_IP:3000`

---

## 5. Nginx Reverse Proxy

```bash
sudo apt install nginx -y
sudo nano /etc/nginx/sites-available/betting-forum
```

Paste:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/betting-forum /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## 6. SSL (Let's Encrypt)

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

Update `NEXTAUTH_URL` in `.env` to `https://yourdomain.com`, then:

```bash
pm2 restart betting-forum
```

---

## Updates

```bash
cd betting-forum
git pull
npm install
npx prisma generate
npm run build
pm2 restart betting-forum
```

---

## Useful Commands

| Command | Purpose |
|---------|---------|
| `pm2 status` | Check app status |
| `pm2 logs betting-forum` | View logs |
| `pm2 restart betting-forum` | Restart app |
| `pm2 stop betting-forum` | Stop app |
