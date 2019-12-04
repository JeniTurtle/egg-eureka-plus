interface IForgedEureka {
  getServiceByAppId(appId: string): Promise<string>;

  getServiceByVipAddress(vipAddress: string): Promise<string>;

  fetchRegistry(): void;

  getInstancesByAppId(
    appId: string,
    cb: (error: Error | null, config: EurekaClient.EurekaInstanceConfig[]) => void,
  ): void;

  getInstancesByVipAddress(
    vidAddress: string,
    cb: (error: Error | null, config: EurekaClient.EurekaInstanceConfig[]) => void,
  ): void;
}

declare module 'egg' {
  interface Application {
    eureka: IForgedEureka;
  }

  interface Agent {
    eureka: any;
  }
}