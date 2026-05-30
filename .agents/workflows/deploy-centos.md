---
description: Deployment process for the eztool.pro system onto a CentOS VM (Phase 1)
---

# CentOS VM Deployment Roadmap

The project's current standard deployment process is done via Containerization.

### Step 1: Build the Image
- Build the application into a base Docker image.
```bash
docker build -t eztool-web .
```

### Step 2: Start the Service
- Run the application container (typically via docker-compose port mapping, e.g. `8080`), or use `pm2` for a direct deployment.

### Step 3: Configure the Web Server (Reverse Proxy)
- Set up **Nginx** on CentOS to act as a Reverse Proxy.
- Point the `eztool.pro` domain to `localhost:8080`.
- Handle Let's Encrypt SSL and Gzip/Brotli at the Nginx layer.

### Step 4: Automate via CDN (Cloudflare)
- Point the `eztool.pro` domain's nameservers to Cloudflare's DNS.
- Enable "Proxied" mode (the orange cloud) on the domain's DNS record.
- Cloudflare caches all assets (SSG html, images, JS, CSS) to offload the origin server.

> **Future note (Cloud phase):** When the architecture moves to Vercel, this process will switch to Push to GitHub → Vercel auto-build/deploy with a global CDN + SSL.
