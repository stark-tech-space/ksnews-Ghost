module.exports = {
  apps : [{
    name: 'news-Ghost',
    script: 'yarn dev',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '16G',
    instance_var: 'INSTANCE_ID',
    node_args: '--max-old-space-size=20480'
  }]
};
