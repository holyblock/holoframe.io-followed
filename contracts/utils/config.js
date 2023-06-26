module.exports = {
  arweave: {
    dev: {
      host: "localhost",
      port: 1984,
      protocol: "http",
      timeout: 20000,
      logging: true,
    },
    prod: {
      host: "arweave.net",
      port: 443,
      protocol: "https",
      timeout: 20000,
      logging: false,
    },
  },
  bundlr: {
    prod: {
      host: "https://node1.bundlr.network",
      currency: "arweave",
    },
  },
};
