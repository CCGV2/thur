module.exports = {
  port: 8081,
  session: {
    secret: 'thur',
    key: 'thur',
    maxAge: 2592000000
  },
  mongodb:"mongodb+srv://gck:gengcongkai@cluster0-yqbl4.azure.mongodb.net/test?retryWrites=true&w=majority",

  mongodbop:{dbName:'thur'}
};
