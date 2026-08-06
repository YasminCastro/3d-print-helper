module.exports = {
  apps: [
    // --- PRODUCTION ---
    {
      name: 'backend',
      script: 'dist/server.js',
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
      time: true, // 로그에 타임스탬프
      log_date_format: 'YYYY-MM-DD HH:mm:ss.SSS',
      node_args: '--enable-source-maps', // 소스맵 스택트레이스
      env: {
        PORT: 4000,
        NODE_ENV: 'production',
      },
    },

    // --- DEVELOPMENT ---
    {
      name: 'dev',
      script: 'src/server.ts',
      interpreter: 'node',
      node_args: '-r ts-node/register -r tsconfig-paths/register --enable-source-maps',
      exec_mode: 'fork',
      instances: 1,
      autorestart: true,
      watch: ['src'],
      watch_delay: 300, // 저장 폭주 시 완충
      ignore_watch: ['node_modules', 'logs', 'dist'],
      max_memory_restart: '1G',
      output: './logs/access.log',
      error: './logs/error.log',
      merge_logs: true,
      time: true,
      env: {
        PORT: 3000,
        NODE_ENV: 'development',
      },
    },
  ],
};
