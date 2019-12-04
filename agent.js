"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const init_1 = require("./lib/init");
exports.default = agent => {
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
    const eureka = await init_1.default(config, agent);
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
    agent.messenger.on('eurekaFetchRegistry', async (eventId) => {
        let error = null;
        try {
            await new Promise((resolve, reject) => {
                eureka.fetchRegistry(err => {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve();
                    }
                });
            });
        }
        catch (err) {
            error = err;
        }
        agent.messenger.sendToApp(eventId, {
            error,
        });
    });
    agent.messenger.on('eurekaGetInstancesByAppId', ({ appId, eventId }) => {
        let instance = null, error = null;
        try {
            instance = eureka.getInstancesByAppId(appId);
        }
        catch (err) {
            error = err;
        }
        agent.messenger.sendToApp(eventId, {
            instance,
            error,
        });
    });
    agent.messenger.on('eurekaGetInstancesByVipAddress', ({ vidAddress, eventId }) => {
        let instance = null, error = null;
        try {
            instance = eureka.getInstancesByVipAddress(vidAddress);
        }
        catch (err) {
            error = err;
        }
        agent.messenger.sendToApp(eventId, {
            instance,
            error,
        });
    });
    return eureka;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWdlbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhZ2VudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHFDQUFvQztBQUVwQyxrQkFBZSxLQUFLLENBQUMsRUFBRTtJQUNyQixNQUFNLEVBQUUsTUFBTSxFQUFFLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQztJQUNoQyxJQUFJLE1BQU0sRUFBRTtRQUNWLEtBQUssQ0FBQyxZQUFZLENBQUMsUUFBUSxFQUFFLFlBQVksQ0FBQyxDQUFDO1FBQzNDLEtBQUssQ0FBQyxXQUFXLENBQUMsS0FBSyxJQUFJLEVBQUU7WUFDM0IsTUFBTSxJQUFJLE9BQU8sQ0FBQyxPQUFPLENBQUMsRUFBRTtnQkFDMUIsS0FBSyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUU7b0JBQ3RCLEtBQUssQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDO29CQUNsQyxJQUFJLEdBQUcsRUFBRTt3QkFDUCxLQUFLLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztxQkFDekI7b0JBQ0QsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUNmLENBQUMsQ0FBQyxDQUFDO1lBQ0wsQ0FBQyxDQUFDLENBQUM7UUFDTCxDQUFDLENBQUMsQ0FBQztLQUNKO0FBQ0gsQ0FBQyxDQUFDO0FBRUYsS0FBSyxVQUFVLFlBQVksQ0FBQyxNQUFNLEVBQUUsS0FBSztJQUN2QyxNQUFNLE1BQU0sR0FBRyxNQUFNLGNBQVUsQ0FBQyxNQUFNLEVBQUUsS0FBSyxDQUFDLENBQUM7SUFFL0Msd0NBQXdDO0lBQ3hDLEtBQUssQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxLQUFLLElBQUksRUFBRTtRQUMzQyxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFO1lBQ2hCLElBQUksR0FBRyxFQUFFO2dCQUNQLEtBQUssQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLGNBQWMsQ0FBQyxDQUFDO2dCQUNuQyxNQUFNLEdBQUcsQ0FBQzthQUNYO1lBQ0QsTUFBTSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQztZQUNyQyxNQUFNLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDakIsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDLENBQUMsQ0FBQztJQUVILEtBQUssQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLHFCQUFxQixFQUFFLEtBQUssRUFBQyxPQUFPLEVBQUMsRUFBRTtRQUN4RCxJQUFJLEtBQUssR0FBRyxJQUFJLENBQUM7UUFDakIsSUFBSTtZQUNGLE1BQU0sSUFBSSxPQUFPLENBQUMsQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLEVBQUU7Z0JBQ3BDLE1BQU0sQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLEVBQUU7b0JBQ3pCLElBQUksR0FBRyxFQUFFO3dCQUNQLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztxQkFDYjt5QkFBTTt3QkFDTCxPQUFPLEVBQUUsQ0FBQztxQkFDWDtnQkFDSCxDQUFDLENBQUMsQ0FBQztZQUNMLENBQUMsQ0FBQyxDQUFDO1NBQ0o7UUFBQyxPQUFPLEdBQUcsRUFBRTtZQUNaLEtBQUssR0FBRyxHQUFHLENBQUM7U0FDYjtRQUNELEtBQUssQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLE9BQU8sRUFBRTtZQUMvQixLQUFLO1NBQ1IsQ0FBQyxDQUFDO0lBQ0wsQ0FBQyxDQUFDLENBQUM7SUFFSCxLQUFLLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQywyQkFBMkIsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxFQUFFLEVBQUU7UUFDckUsSUFBSSxRQUFRLEdBQVEsSUFBSSxFQUN0QixLQUFLLEdBQVEsSUFBSSxDQUFDO1FBQ3BCLElBQUk7WUFDRixRQUFRLEdBQUcsTUFBTSxDQUFDLG1CQUFtQixDQUFDLEtBQUssQ0FBQyxDQUFDO1NBQzlDO1FBQUMsT0FBTyxHQUFHLEVBQUU7WUFDWixLQUFLLEdBQUcsR0FBRyxDQUFDO1NBQ2I7UUFDRCxLQUFLLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxPQUFPLEVBQUU7WUFDakMsUUFBUTtZQUNSLEtBQUs7U0FDTixDQUFDLENBQUM7SUFDTCxDQUFDLENBQUMsQ0FBQztJQUVILEtBQUssQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLGdDQUFnQyxFQUFFLENBQUMsRUFBRSxVQUFVLEVBQUUsT0FBTyxFQUFFLEVBQUUsRUFBRTtRQUMvRSxJQUFJLFFBQVEsR0FBUSxJQUFJLEVBQ3RCLEtBQUssR0FBUSxJQUFJLENBQUM7UUFDcEIsSUFBSTtZQUNGLFFBQVEsR0FBRyxNQUFNLENBQUMsd0JBQXdCLENBQUMsVUFBVSxDQUFDLENBQUM7U0FDeEQ7UUFBQyxPQUFPLEdBQUcsRUFBRTtZQUNaLEtBQUssR0FBRyxHQUFHLENBQUM7U0FDYjtRQUNELEtBQUssQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLE9BQU8sRUFBRTtZQUNqQyxRQUFRO1lBQ1IsS0FBSztTQUNOLENBQUMsQ0FBQztJQUNMLENBQUMsQ0FBQyxDQUFDO0lBRUgsT0FBTyxNQUFNLENBQUM7QUFDaEIsQ0FBQyJ9