module.exports = {
  port: 8081,
  session: {
    secret: 'thur',
    key: 'thur',
    maxAge: 2592000000
  },
  mongodb: 'mongodb://localhost:27017/thur'
};