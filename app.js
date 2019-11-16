"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const uuidV1 = require("uuid/v1");
exports.default = app => {
    if (app.config.eureka) {
        app.eureka = new ForgedEureka(app);
    }
};
/**
 * 只有在egg-ready之后才能跟agent才能跟app通信，
 * 所以这里的api只能在serverDidReady之后调用
 */
class ForgedEureka {
    constructor(_app) {
        this._app = _app;
    }
    getInstancesByAppId(appId, cb) {
        const uuid = uuidV1();
        this._app.messenger.sendToAgent('eurekaGetInstancesByAppId', {
            appId,
            eventId: uuid,
        });
        this._app.messenger.once(uuid, ({ instance, error }) => {
            cb(error, instance);
        });
    }
    getInstancesByVipAddress(vidAddress, cb) {
        const uuid = uuidV1();
        this._app.messenger.sendToAgent('eurekaGetInstancesByVipAddress', {
            vidAddress,
            eventId: uuid,
        });
        this._app.messenger.once(uuid, ({ instance, error }) => {
            cb(error, instance);
        });
    }
    async getServiceByAppId(appId) {
        return await new Promise((resolve, reject) => {
            this.getInstancesByAppId(appId, (error, clients) => {
                if (error) {
                    this._app.logger.error(error);
                    reject(error);
                }
                else {
                    if (!clients || clients.length === 0) {
                        const err = new Error(`服务[${appId}]未找到，请重试`);
                        this._app.logger.error(err);
                        reject(err);
                    }
                    const serviceIndex = Math.floor(Math.random() * clients.length);
                    // @ts-ignore
                    resolve(`http://${clients[serviceIndex].ipAddr}:${clients[serviceIndex].port.$}`);
                }
            });
        });
    }
    async getServiceByVipAddress(vipAddress) {
        return await new Promise((resolve, reject) => {
            this.getInstancesByVipAddress(vipAddress, (error, clients) => {
                if (error) {
                    this._app.logger.error(error);
                    reject(error);
                }
                else {
                    if (!clients || clients.length === 0) {
                        const err = new Error(`服务[${vipAddress}]未找到，请重试`);
                        this._app.logger.error(err);
                        reject(err);
                    }
                    const serviceIndex = Math.floor(Math.random() * clients.length);
                    resolve(`http://${clients[serviceIndex].instanceId}`);
                }
            });
        });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYXBwLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQ0Esa0NBQW1DO0FBa0JuQyxrQkFBZSxHQUFHLENBQUMsRUFBRTtJQUNuQixJQUFJLEdBQUcsQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFO1FBQ3JCLEdBQUcsQ0FBQyxNQUFNLEdBQUcsSUFBSSxZQUFZLENBQUMsR0FBRyxDQUFDLENBQUM7S0FDcEM7QUFDSCxDQUFDLENBQUM7QUFFRjs7O0dBR0c7QUFDSCxNQUFNLFlBQVk7SUFDaEIsWUFBb0IsSUFBSTtRQUFKLFNBQUksR0FBSixJQUFJLENBQUE7SUFBRyxDQUFDO0lBRTVCLG1CQUFtQixDQUFDLEtBQWEsRUFBRSxFQUFFO1FBQ25DLE1BQU0sSUFBSSxHQUFHLE1BQU0sRUFBRSxDQUFDO1FBQ3RCLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQywyQkFBMkIsRUFBRTtZQUMzRCxLQUFLO1lBQ0wsT0FBTyxFQUFFLElBQUk7U0FDZCxDQUFDLENBQUM7UUFDSCxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUMsRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFFLEVBQUUsRUFBRTtZQUNyRCxFQUFFLENBQUMsS0FBSyxFQUFFLFFBQVEsQ0FBQyxDQUFDO1FBQ3RCLENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUVELHdCQUF3QixDQUFDLFVBQWtCLEVBQUUsRUFBRTtRQUM3QyxNQUFNLElBQUksR0FBRyxNQUFNLEVBQUUsQ0FBQztRQUN0QixJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxXQUFXLENBQUMsZ0NBQWdDLEVBQUU7WUFDaEUsVUFBVTtZQUNWLE9BQU8sRUFBRSxJQUFJO1NBQ2QsQ0FBQyxDQUFDO1FBQ0gsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFD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