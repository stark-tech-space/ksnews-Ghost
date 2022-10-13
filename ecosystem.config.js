module.exports = {
  apps : [{
    name: 'ksnews-Ghost',
    script: 'yarn dev',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '4G',
    instance_var: 'INSTANCE_ID',
  }],
  deploy : {
    test : {
      user : 'ubuntu',
      host : '54.249.167.108',
      ref  : 'origin/master',
      repo : 'git@github.com:stark-tech-space/ksnews-Ghost.git',
      path : '/home/ubuntu/ksnews-Ghost',
      'post-deploy' : 'npm install && pm2 reload ecosystem.config.js --env production',
      'pre-setup': 'yarn setup'
    }
  }
};
