/**
 * PM2 — keeps `next dev` running in the background (survives closing the terminal).
 * Port 3100 — 3000 is occupied by another local project (animatedmockups).
 *
 * Usage:
 *   npm run dev:daemon        # start in background
 *   npm run dev:daemon:stop     # stop
 *   npm run dev:daemon:logs     # stream logs
 * Optional (run once per machine): `npx pm2 startup` then `npx pm2 save` to revive after reboot.
 */
module.exports = {
  apps: [
    {
      name: "post-booking-experience",
      cwd: __dirname,
      script: "node_modules/next/dist/bin/next",
      args: "dev --turbopack --port 3100",
      autorestart: true,
      max_restarts: 50,
      min_uptime: "10s",
      exp_backoff_restart_delay: 2000,
      env: {
        NODE_ENV: "development",
      },
    },
  ],
};
