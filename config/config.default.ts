module.exports = () => {
  const config: any = {
    eureka: {
      client: {
        shouldUseDelta: true,
      },
    },
  };

  return config;
};
