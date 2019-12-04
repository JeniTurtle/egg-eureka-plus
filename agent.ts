import eurekaInit from './lib/init';

export default agent => {
  const { eureka } = agent.config;
  if (eureka) {
    agent.addSingleton('eureka', createEureka);
    agent.beforeClose(async () => {
      await new Promise(resolve => {
        agent.eureka.stop(err => {
          agent.logger.info('eureka已注销该服务');
          if (err) {
            agent.logger.error(err);
          }
          resolve(err);
        });
      });
    });
  }
};

async function createEureka(config, agent) {
  const eureka = await eurekaInit(config, agent);

  // 当所有worker启动完毕时，再重新注册eureka服务，把状态设置为UP
  agent.messenger.once('egg-ready', async () => {
    eureka.stop(err => {
      if (err) {
        agent.logger.error('eureka重新注册失败');
        throw err;
      }
      eureka.config.instance.status = 'UP';
      eureka.start();
    });
  });

  agent.messenger.on('eurekaFetchRegistry', async eventId => {
    let error = null;
    try {
      await new Promise((resolve, reject) => {
        eureka.fetchRegistry(err => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      });
    } catch (err) {
      error = err;
    }
    agent.messenger.sendToApp(eventId, {
        error,
    });
  });

  agent.messenger.on('eurekaGetInstancesByAppId', ({ appId, eventId }) => {
    let instance: any = null,
      error: any = null;
    try {
      instance = eureka.getInstancesByAppId(appId);
    } catch (err) {
      error = err;
    }
    agent.messenger.sendToApp(eventId, {
      instance,
      error,
    });
  });

  agent.messenger.on('eurekaGetInstancesByVipAddress', ({ vidAddress, eventId }) => {
    let instance: any = null,
      error: any = null;
    try {
      instance = eureka.getInstancesByVipAddress(vidAddress);
    } catch (err) {
      error = err;
    }
    agent.messenger.sendToApp(eventId, {
      instance,
      error,
    });
  });

  return eureka;
}
