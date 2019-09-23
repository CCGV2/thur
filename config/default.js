module.exports = {
  port: 8081,
  session: {
    secret: 'thur',
    key: 'thur',
    maxAge: 2592000000
  },
  mongodb:`mongodb://gck:gengcongkai@cluster0-shard-00-00-yqbl4.azure.mongodb.net:27017,cluster0-shard-00-02-yqbl4.azure.mongodb.net:27017,cluster0-shard-00-01-yqbl4.azure.mongodb.net:27017/thur?ssl=true&replicaSet=Pydow-shard-0&authSource=admin&retryWrites=true`

};
