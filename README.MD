# egg-eureka-plus
一款优雅的egg eureka插件！

# 使用理念

> agent进程启动时，会用单例模式初始eureka实例，并注册服务,状态为OUT_OF_SERVICE（不可用，因为这时app worker并未开始启动）。

> 这时我们可以给项目里agent.js中的didReady声明周期，加入远程获取配置文件的方法，并保存文件到run目录中。

> 等app worker启动时，可以在configWillLoad声明周期中读取临时生成的remote配置文件，然后根据情况依次修改app.config的配置项。

> 最后在agent进程中使用agent.messenger.once方法监听egg-ready事件，如果所有app worker启动成功，则把服务状态OUT_OF_SERVICE改为UP。

# 安装
$ npm i egg-eureka-plus --save

# 配置

示例：（具体参考eureka-js-client）

```js
// 项目名/config/plugin.js

const plugin = {
  eureka: {
    enable: true,
    package: 'egg-eureka-plus',
  },
};

```

```js
// 项目名/config/config.default.js

config.eureka = {
    client: {
      instance: {
        instanceId: '127.0.0.1:9999',
        app: 'node-service',
        hostName: '127.0.0.1',
        ipAddr: '127.0.0.1',
        statusPageUrl: `http://127.0.0.1:9999/eureka/info`, // spring admin 注册心跳
        healthCheckUrl: `http://127.0.0.1:9999/eureka/health`, // eureka 注册心跳
        port: {
          $: port,
          '@enabled': 'true',
        },
        vipAddress: 'node-service',
        dataCenterInfo: {
          '@class': 'com.netflix.appinfo.InstanceInfo$DefaultDataCenterInfo',
          name: 'MyOwn',
        },
      },
      eureka: {
        registryFetchInterval: 3000,
        // 有多个 eureka 集群
        serviceUrls: {
          default: ['http://10.0.0.110:8899/eureka/apps/'],
        },
      },
    },
  };
```


# 使用方式

> 挂载的app.eureka实例，主要开放4个api，分别是：

```typescript
  getServiceByAppId(appId: string): Promise<string>;
  getServiceByVipAddress(vipAddress: string): Promise<string>;
  getInstancesByAppId(
    appId: string,
    cb: (error: Error | null, config: EurekaClient.EurekaInstanceConfig[]) => void,
  ): void;
  getInstancesByVipAddress(
    vidAddress: string,
    cb: (error: Error | null, config: EurekaClient.EurekaInstanceConfig[]) => void,
  ): void;

```
> 这4个api都是代理到agent进程进行去执行的，用来获取eureka注册中心上指定的服务地址。


# 应用示例
```js
// 项目名/app.ts

import { Application, IBoot } from 'egg';
import { initConfig } from './lib/config_handler';

const sequelize = require('egg-sequelize/app');

export default class FooBoot implements IBoot {
  constructor(private readonly app: Application) {}

  async configWillLoad() {
    // 从临时文件中读取agentWorker保存的远程配置文件，并修改当前项目中的config文件。
    initConfig(this.app);
  }

  // Config, plugin files have been loaded.
  configDidLoad() {

  }

  // All files have loaded, start plugin here.
  async didLoad() {

  }

  // All plugins have started, can do some thing before app ready.
  async willReady() {
    // sequelize配置依赖于eureka插件，但官方egg-sequelize在worker启动时会检查配置文件参数类型，由于定义的模板格式不符合类型，所以这里手动延后执行。
    sequelize(this.app);
  }

  // Worker is ready, can do some things
  async didReady() {

  }

  // Server is listening.
  async serverDidReady() {

  }

  // Do some thing before app close.
  async beforeClose() {

  }
}
```

```js
// 项目名/agent.ts

import { Agent } from 'egg';
import { saveRemoteConfig, initConfig } from './lib/config_handler';

export default class AgentBootHook {
  constructor(private readonly agent: Agent) {}

  async didReady() {
    // 把springCloud远程配置保存到临时文件，供appWorker调用。
    await saveRemoteConfig(this.agent);
    // 从临时文件中读取agentWorker保存的远程配置文件，并修改当前项目中的config文件。
    initConfig(this.agent);
  }
}
```

```js
// 项目名/lib/config_handler.ts

import { Agent, EggApplication } from 'egg';
import * as fs from 'fs';
import * as path from 'path';
import * as assert from 'assert';
import * as YAML from 'yamljs';
import * as is from 'is-type-of';

// 临时写入的远程配置文件
export const runtimeFile = './run/eureka-remote-config.json';

/**
 * 使用字符串深度获取对象属性
 * @param object
 * @param path
 * @param defaultValue
 */
export const deepGet = (object, path, defaultValue?) => {
  return (
    (!Array.isArray(path)
      ? path
          .replace(/\[/g, '.')
          .replace(/\]/g, '')
          .split('.')
      : path
    ).reduce((o, k) => (o || {})[k], object) || defaultValue
  );
};

/**
 * 深度遍历配置文件，检查模板字段，并替换。
 * @param obj
 * @param cb
 */
export const depthSearch = (obj, config) => {
  const regular = /^\$\{(.*)+\}$/;
  for (const index in obj) {
    const item = obj[index];
    if (is.object(item)) {
      depthSearch(item, config);
    } else if (is.string(item) && regular.test(item)) {
      // console.log(item,  deepGet(config, temp[1], ''));
      const temp = item.match(regular);
      obj[index] = deepGet(config, temp[1], '');
    }
  }
};

/**
 * agentWorker获取springCloud配置数据，
 * 写入到运行时文件中，供appWorker调用。
 * @param agent
 */
export const saveRemoteConfig = async (agent: Agent) => {
  const { eureka, config } = agent;
  const { configServer: { name, basicAuth, configFile } } = config.eureka.apps;
  const instances = eureka.getInstancesByAppId(name);
  assert(instances.length > 0, `springCloud配置中心${name}实例获取失败！`);
  try {
    const resp = await agent.curl(`${instances[0].homePageUrl}/${configFile}`, {
      auth: `${basicAuth.username}:${basicAuth.password}`,
    });
    const configData = YAML.parse(resp.data.toString());
    const tempConfigFile = path.join(agent.baseDir, runtimeFile);
    fs.writeFileSync(tempConfigFile, JSON.stringify(configData));
  } catch (err) {
    agent.logger.error('springCloud配置文件获取失败！');
    throw err;
  }
};

/**
 * 从临时文件中读取agentWorker保存的远程配置文件，
 * 并修改当前项目中的config文件。
 * @param app
 */
export const initConfig = (app: EggApplication) => {
  const tempConfigFile = path.join(app.baseDir, runtimeFile);
  try {
    const content = fs.readFileSync(tempConfigFile);
    const remoteConfig = JSON.parse(content.toString());
    depthSearch(app.config, remoteConfig);
  } catch (err) {
    app.logger.error('springCloud配置文件读取失败！');
    throw err;
  }
};

```

```js
// 项目名/config/config.dev.ts

import { EggAppConfig } from 'egg';

export default () => {
  const config: PowerPartial<EggAppConfig> = {};
  
  config.redis = {
    client: {
      port: '${redis.port}', // 从springCloud配置中取
      host: '${redis.host}',
      password: '${redis.password}',
      db: '${redis.database}',
    },
  };

  config.sequelize = {
    dialect: 'postgres', // support: mysql, mariadb, postgres, mssql
    database: '${database.name}',
    host: '${database.host}',
    port: '${database.port}',
    username: '${database.username}',
    password: '${database.password}',
    timezone: '+08:00',
  };

  return config;
};

```
```yml
# 远程配置文件示例：config.dev.yml

# 数据库的基础配置
database:
  host: '127.0.0.1'
  port: '1024'
  username: 'fuck'
  password: 'shit'
  name: 'dbname'

# redis的基础配置
redis:
  host: '127.0.0.1'
  port: '1025'
  password: 'fuck'
  database: 1

```



