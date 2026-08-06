module.exports = {
  apps: [
    {
      name: 'frontend',
      script: './node_modules/.bin/next',
      args: 'start -p 3000',
      exec_mode: 'fork', // servidor fraco/instável: fork+1 instância é mais previsível que cluster
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      min_uptime: '30s', // só conta como "up" após 30s, evita loop de restart em falha rápida
      max_restarts: 10,
      restart_delay: 5000,
      output: './logs/access.log',
      error: './logs/error.log',
      merge_logs: true,
      time: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss.SSS',
      env: {
        PORT: 3000,
        NODE_ENV: 'production',
      },
    },
  ],
};
