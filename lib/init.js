"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const eureka_js_client_1 = require("eureka-js-client");
exports.default = async (config, agent) => {
    const logger = (...args) => {
        const used = typeof args[1] === 'number' ? `(${args[1]}ms)` : '';
        agent.logger.info('[egg-eureka]%s %s', used, args[0]);
    };
    const eureka = new eureka_js_client_1.Eureka(config);
    eureka.register = (callback = _err => { }, status) => {
        if (status) {
            eureka.config.instance.status = status;
        }
        const connectionTimeout = setTimeout(() => {
            eureka.logger.warn("It looks like it's taking a while to register with " +
                'Eureka. This usually means there is an issue connecting to the host ' +
                'specified. Start application with NODE_DEBUG=request for more logging.');
        }, 10000);
        eureka.eurekaRequest({
            method: 'POST',
            uri: eureka.config.instance.app,
            json: true,
            body: { instance: eureka.config.instance },
        }, (error, response, body) => {
            clearTimeout(connectionTimeout);
            if (!error && response.statusCode === 204) {
                eureka.logger.info(`registered with eureka [${status}]: `, `${eureka.config.instance.app}/${eureka.instanceId}`);
                eureka.emit('registered');
                return callback(null);
            }
            else if (error) {
                eureka.logger.warn('Error registering with eureka client.', error);
                return callback(error);
            }
            return callback(new Error(`eureka registration FAILED: status: ${response.statusCode} body: ${body}`));
        });
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
            }
            else {
                logger('eureka启动失败');
                reject(err);
            }
        });
    });
    return eureka;
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5pdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImluaXQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSx1REFBMEM7QUFDMUMsa0JBQWUsS0FBSyxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsRUFBRTtJQUNyQyxNQUFNLE1BQU0sR0FBRyxDQUFDLEdBQUcsSUFBVyxFQUFFLEVBQUU7UUFDaEMsTUFBTSxJQUFJLEdBQUcsT0FBTyxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssUUFBUSxDQUFDLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7UUFDakUsS0FBSyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsbUJBQW1CLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ3hELENBQUMsQ0FBQztJQUVGLE1BQU0sTUFBTSxHQUFRLElBQUkseUJBQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUV2QyxNQUFNLENBQUMsUUFBUSxHQUFHLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxFQUFFLEdBQUUsQ0FBQyxFQUFFLE1BQWUsRUFBRSxFQUFFO1FBQzNELElBQUksTUFBTSxFQUFFO1lBQ1YsTUFBTSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztTQUN4QztRQUNELE1BQU0saUJBQWlCLEdBQUcsVUFBVSxDQUFDLEdBQUcsRUFBRTtZQUN4QyxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FDaEIscURBQXFEO2dCQUNuRCxzRUFBc0U7Z0JBQ3RFLHdFQUF3RSxDQUMzRSxDQUFDO1FBQ0osQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQ1YsTUFBTSxDQUFDLGFBQWEsQ0FDbEI7WUFDRSxNQUFNLEVBQUUsTUFBTTtZQUNkLEdBQUcsRUFBRSxNQUFNLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxHQUFHO1lB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