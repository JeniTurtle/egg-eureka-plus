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
    fetchRegistry() {
        const uuid = uuidV1();
        this._app.messenger.sendToAgent('eurekaFetchRegistry', {
            eventId: uuid,
        });
        this._app.messenger.once(uuid, error => {
            if (error) {
                this._app.logger.error(error);
            }
        });
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
                    return reject(error);
                }
                else {
                    if (!clients || clients.length === 0) {
                        const err = new Error(`服务[${appId}]未找到，请重试`);
                        this._app.logger.error(err);
                        return reject(err);
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
                    return reject(error);
                }
                else {
                    if (!clients || clients.length === 0) {
                        const err = new Error(`服务[${vipAddress}]未找到，请重试`);
                        this._app.logger.error(err);
                        return reject(err);
                    }
                    const serviceIndex = Math.floor(Math.random() * clients.length);
                    resolve(`http://${clients[serviceIndex].instanceId}`);
                }
            });
        });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYXBwLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQ0Esa0NBQW1DO0FBRW5DLGtCQUFlLEdBQUcsQ0FBQyxFQUFFO0lBQ25CLElBQUksR0FBRyxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUU7UUFDckIsR0FBRyxDQUFDLE1BQU0sR0FBRyxJQUFJLFlBQVksQ0FBQyxHQUFHLENBQUMsQ0FBQztLQUNwQztBQUNILENBQUMsQ0FBQztBQUVGOzs7R0FHRztBQUNILE1BQU0sWUFBWTtJQUNoQixZQUFvQixJQUFJO1FBQUosU0FBSSxHQUFKLElBQUksQ0FBQTtJQUFHLENBQUM7SUFFNUIsYUFBYTtRQUNYLE1BQU0sSUFBSSxHQUFHLE1BQU0sRUFBRSxDQUFDO1FBQ3RCLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxxQkFBcUIsRUFBRTtZQUNyRCxPQUFPLEVBQUUsSUFBSTtTQUNkLENBQUMsQ0FBQztRQUNILElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLEVBQUU7WUFDckMsSUFBSSxLQUFLLEVBQUU7Z0JBQ1QsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO2FBQy9CO1FBQ0gsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDO0lBRUQsbUJBQW1CLENBQUMsS0FBYSxFQUFFLEVBQUU7UUFDbkMsTUFBTSxJQUFJLEdBQUcsTUFBTSxFQUFFLENBQUM7UUFDdEIsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsV0FBVyxDQUFDLDJCQUEyQixFQUFFO1lBQzNELEtBQUs7WUFDTCxPQUFPLEVBQUUsSUFBSTtTQUNkLENBQUMsQ0FBQztRQUNILElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxFQUFFLFFBQVEsRUFB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