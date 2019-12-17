module.exports = () => {
  const config: any = {
    eureka: {
      client: {
        shouldUseDelta: false,
      },
    },
  };

  return config;
};
