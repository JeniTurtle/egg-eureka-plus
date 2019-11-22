import { Eureka } from 'eureka-js-client';
export default async (config, agent) => {
  const logger = (...args: any[]) => {
    const used = typeof args[1] === 'number' ? `(${args[1]}ms)` : '';
    agent.logger.info('[egg-eureka]%s %s', used, args[0]);
  };

  const eureka: any = new Eureka(config);
  eureka.logger.info = str => agent.logger.info(`[egg-eureka] ${str}`);
  eureka.logger.warn = str => agent.logger.warn(`[egg-eureka] ${str}`);

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
            `registered with eureka [${eureka.config.instance.status}]: `,
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
