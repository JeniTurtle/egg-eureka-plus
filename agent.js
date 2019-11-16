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
        eureka.deregister(err => {
            if (err) {
                agent.logger.error('eureka重新注册失败');
                throw err;
            }
            eureka.config.instance.status = 'UP';
            eureka.start();
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWdlbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhZ2VudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHFDQUFvQztBQUVwQyxrQkFBZSxLQUFLLENBQUMsRUFBRTtJQUNyQixNQUFNLEVBQUUsTUFBTSxFQUFFLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQztJQUNoQyxJQUFJLE1BQU0sRUFBRTtRQUNWLEtBQUssQ0FBQyxZQUFZLENBQUMsUUFBUSxFQUFFLFlBQVksQ0FBQyxDQUFDO1FBQzNDLEtBQUssQ0FBQyxXQUFXLENBQUMsS0FBSyxJQUFJLEVBQUU7WUFDM0IsTUFBTSxJQUFJLE9BQU8sQ0FBQyxPQUFPLENBQUMsRUFBRTtnQkFDMUIsS0FBSyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUU7b0JBQ3RCLEtBQUssQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDO29CQUNsQyxJQUFJLEdBQUcsRUFBRTt3QkFDUCxLQUFLLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztxQkFDekI7b0JBQ0QsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUNmLENBQUMsQ0FBQyxDQUFDO1lBQ0wsQ0FBQyxDQUFDLENBQUM7UUFDTCxDQUFDLENBQUMsQ0FBQztLQUNKO0FBQ0gsQ0FBQyxDQUFDO0FBRUYsS0FBSyxVQUFVLFlBQVksQ0FBQyxNQUFNLEVBQUUsS0FBSztJQUN2QyxNQUFNLE1BQU0sR0FBRyxNQUFNLGNBQVUsQ0FBQyxNQUFNLEVBQUUsS0FBSyxDQUFDLENBQUM7SUFFL0Msd0NBQXdDO0lBQ3hDLEtBQUssQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxLQUFLLElBQUksRUFBRTtRQUMzQyxNQUFNLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxFQUFFO1lBQ3RCLElBQUksR0FBRyxFQUFFO2dCQUNQLEtBQUssQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLGNBQWMsQ0FBQyxDQUFDO2dCQUNuQyxNQUFNLEdBQUcsQ0FBQzthQUNYO1lBQ0QsTUFBTSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQztZQUNyQyxNQUFNLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDakIsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDLENBQUMsQ0FBQztJQUVILEtBQUssQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLDJCQUEyQixFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLEVBQUUsRUFBRTtRQUNyRSxJQUFJLFFBQVEsR0FBUSxJQUFJLEVBQ3RCLEtBQUssR0FBUSxJQUFJLENBQUM7UUFDcEIsSUFBSTtZQUNGLFFBQVEsR0FBRyxNQUFNLENBQUMsbUJBQW1CLENBQUMsS0FBSyxDQUFDLENBQUM7U0FDOUM7UUFBQyxPQUFPLEdBQUcsRUFBRTtZQUNaLEtBQUssR0FBRyxHQUFHLENBQUM7U0FDYjtRQUNELEtBQUssQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLE9BQU8sRUFBRTtZQUNqQyxRQUFRO1lBQ1IsS0FBSztTQUNOLENBQUMsQ0FBQztJQUNMLENBQUMsQ0FBQyxDQUFDO0lBRUgsS0FBSyxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsZ0NBQWdDLEVBQUUsQ0FBQyxFQUFFLFVBQVUsRUFBRSxPQUFPLEVBQUUsRUFBRSxFQUFFO1FBQy9FLElBQUksUUFBUSxHQUFRLElBQUksRUFDdEIsS0FBSyxHQUFRLElBQUksQ0FBQztRQUNwQixJQUFJO1lBQ0YsUUFBUSxHQUFHLE1BQU0sQ0FBQyx3QkFBd0IsQ0FBQyxVQUFVLENBQUMsQ0FBQztTQUN4RDtRQUFDLE9BQU8sR0FBRyxFQUFFO1lBQ1osS0FBSyxHQUFHLEdBQUcsQ0FBQztTQUNiO1FBQ0QsS0FBSyxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsT0FBTyxFQUFFO1lBQ2pDLFFBQVE7WUFDUixLQUFLO1NBQ04sQ0FBQyxDQUFDO0lBQ0wsQ0FBQyxDQUFDLENBQUM7SUFFSCxPQUFPLE1BQU0sQ0FBQztBQUNoQixDQUFDIn0=