import { Eureka } from 'eureka-js-client';
export default async (config, agent) => {
  const logger = (...args: any[]) => {
    const used = typeof args[1] === 'number' ? `(${args[1]}ms)` : '';
    agent.logger.info('[egg-eureka]%s %s', used, args[0]);
  };

  const eureka: any = new Eureka(config);

  eureka.register = (callback = _err => {}, status?: string) => {
    if (status) {
      eureka.config.instance.status = status;
    }
    const connectionTimeout = setTimeout(() => {
      eureka.logger.warn(
        "It looks like it's taking a while to register with " +
          'Eureka. This usually means there is an issue connecting to the host ' +
          'specified. Start application with NODE_DEBUG=request for more logging.',
      );
    }, 10000);
    eureka.eurekaRequest(
      {
        method: 'POST',
        uri: eureka.config.instance.app,
        json: true,
        body: { instance: eureka.config.instance },
      },
      (error, response, body) => {
        clearTimeout(connectionTimeout);
        if (!error && response.statusCode === 204) {
          eureka.logger.info(
            `registered with eureka [${status}]: `,
            `${eureka.config.instance.app}/${eureka.instanceId}`,
          );
          eureka.emit('registered');
          return callback(null);
        } else if (error) {
          eureka.logger.warn('Error registering with eureka client.', error);
          return callback(error);
        }
        return callback(new Error(`eureka registration FAILED: status: ${response.statusCode} body: ${body}`));
      },
    );
  };

  // @ts-ignore
  eureka.on('started', () => {
    logger('eureka启动成功');
  });

  // @ts-ignore
  eureka.on('registered	', () => {
    logger('eureka注册成功');
  });

  // @ts-ignore
  eureka.on('deregistered	', () => {
    logger('eureka已注销');
  });

  // @ts-ignore
  eureka.on('registryUpdated	', () => {
    logger('eureka更新注册成功');
  });

  await new Promise((resolve, reject) => {
    eureka.config.instance.status = 'OUT_OF_SERVICE';
    eureka.start((err, data) => {
      if (!err) {
        resolve(data);
      } else {
        logger('eureka启动失败');
        reject(err);
      }
    });
  });

  return eureka;
};
