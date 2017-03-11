var config = {}
if (process.env.NODE_ENV.match(/prod/)) {
  Object.assign(conf, {
    services: ['sauce'],
    user: process.env.SAUCE_USERNAME,
    key: process.env.SAUCE_ACCESS_KEY,
    sauceConnect: true
  })
}

export.config = config
