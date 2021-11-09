module.exports = {
  port: 8081,
  session: {
    secret: 'thur',
    key: 'thur',
    maxAge: 2592000000
  },
  // the database I used.
  //mongodb:"mongodb://CCGV2:gengcongkai@62.234.114.20:27017/thur"
  // a local test database
  mongodb:"mongodb://CCGV2:gengcongkai@127.0.0.1:27017/thur"
};
