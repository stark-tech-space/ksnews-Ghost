module.exports = {
  apps : [{
    name: 'ksnews-Ghost',
    script: 'yarn dev',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '4G',
    instance_var: 'INSTANCE_ID',
  }]
};
