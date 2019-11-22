"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const eureka_js_client_1 = require("eureka-js-client");
exports.default = async (config, agent) => {
    const logger = (...args) => {
        const used = typeof args[1] === 'number' ? `(${args[1]}ms)` : '';
        agent.logger.info('[egg-eureka]%s %s', used, args[0]);
    };
    const eureka = new eureka_js_client_1.Eureka(config);
    eureka.logger.info = str => agent.logger.info(`[egg-eureka] ${str}`);
    eureka.logger.warn = str => agent.logger.warn(`[egg-eureka] ${str}`);
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
                eureka.logger.info(`registered with eureka [${eureka.config.instance.status}]: `, `${eureka.config.instance.app}/${eureka.instanceId}`);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5pdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImluaXQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSx1REFBMEM7QUFDMUMsa0JBQWUsS0FBSyxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsRUFBRTtJQUNyQyxNQUFNLE1BQU0sR0FBRyxDQUFDLEdBQUcsSUFBVyxFQUFFLEVBQUU7UUFDaEMsTUFBTSxJQUFJLEdBQUcsT0FBTyxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssUUFBUSxDQUFDLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7UUFDakUsS0FBSyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsbUJBQW1CLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ3hELENBQUMsQ0FBQztJQUVGLE1BQU0sTUFBTSxHQUFRLElBQUkseUJBQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUN2QyxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksR0FBRyxHQUFHLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLGdCQUFnQixHQUFHLEVBQUUsQ0FBQyxDQUFDO0lBQ3JFLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxHQUFHLEdBQUcsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLEdBQUcsRUFBRSxDQUFDLENBQUM7SUFFckUsTUFBTSxDQUFDLFFBQVEsR0FBRyxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsRUFBRSxHQUFFLENBQUMsRUFBRSxNQUFlLEVBQUUsRUFBRTtRQUMzRCxJQUFJLE1BQU0sRUFBRTtZQUNWLE1BQU0sQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7U0FDeEM7UUFDRCxNQUFNLGlCQUFpQixHQUFHLFVBQVUsQ0FBQyxHQUFHLEVBQUU7WUFDeEMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQ2hCLHFEQUFxRDtnQkFDbkQsc0VBQXNFO2dCQUN0RSx3RUFBd0UsQ0FDM0UsQ0FBQztRQUNKLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUNWLE1BQU0sQ0FBQyxhQUFhLENBQ2xCO1lBQ0UsTUFBTSxFQUFFLE1BQU07WUFDZCxHQUFHLEVBQUUsTUFBTSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsR0FBRztZQUMvQixJQUFJLEVBQUUsSUFBSTtZQUNWLElBQUksRUFBRSxFQUFFLFFBQVEsRUFBRSxNQUFNLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRTtTQUMzQyxFQUNELENBQUMsS0FBSyxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUsRUFBRTtZQUN4QixZQUFZLENBQUMsaUJBQWlCLENBQUMsQ0FBQztZQUNoQyxJQUFJLENBQUMsS0FBSyxJQUFJLFFBQVEsQ0FBQyxVQUFVLEtBQUssR0FBRyxFQUFFO2dCQUN6QyxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FDaEIsMkJBQTJCLE1BQU0sQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLE1BQU0sS0FBSyxFQUM3RCxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLEdBQUcsSUFBSSxNQUFNLENBQUMsVUFBVSxFQUFFLENBQ3JELENBQUM7Z0JBQ0YsTUFBTSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQztnQkFDMUIsT0FBTyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7YUFDdkI7aUJBQU0sSUFBSSxLQUFLLEVBQUU7Z0JBQ2hCLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLHVDQUF1QyxFQUFFLEtBQUssQ0FBQyxDQUFDO2dCQUNuRSxPQUFPLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQzthQUN4QjtZQUNELE9BQU8sUUFBUSxDQUFDLElBQUksS0FBSyxDQUFDLHVDQUF1QyxRQUFRLENBQUMsVUFBVSxVQUFVLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQztRQUN6RyxDQUFDLENBQ0YsQ0FBQztJQUNKLENBQUMsQ0FBQztJQUVGLE1BQU0sSUFBSSxPQUFPLENBQUMsQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLEVBQUU7UUFDcEMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsTUFBTSxHQUFHLGdCQUFnQixDQUFDO1FBQ2pELE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLEVBQUUsSUFBSSxFQUFFLEVBQUU7WUFDekIsSUFBSSxDQUFDLEdBQUcsRUFBRTtnQkFDUixPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7YUFDZjtpQkFBTTtnQkFDTCxNQUFNLENBQUMsWUFBWSxDQUFDLENBQUM7Z0JBQ3JCLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQzthQUNiO1FBQ0gsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDLENBQUMsQ0FBQztJQUVILE9BQU8sTUFBTSxDQUFDO0FBQ2hCLENBQUMsQ0FBQyJ9