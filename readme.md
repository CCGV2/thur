安装依赖时按照package.json中的版本进行安装可能可以避免一些不必要的错误

使用pm2进行部署
pm2 start index.js

数据库的账号密码在config/default.js下
数据格式在models下

mongodb相关的操作说明可以百度到

controller是封装好的函数们 包括登陆验证，访问验证，保存到数据库等等

lib下的mongo.js包含数据格式以及封装好的函数

middlewares下是是否已登陆的验证

models下也是数据格式，和上面的用途不一样所以代码格式不一样。

public中存放一些资源，包括css、img、js、release。dfd.js就在此处

routes中存放路由，就是一些跳转相关的支持，其中index是总路由，具体函数在各自的文件中。

tools下的dfd.js是后端相关的gojs的操作，尽量和public下保持一致，但是不一致好像也没啥影响。
缩略图相关的实现其实在这里，所以如果出现了问题优先怀疑这里。

views下是一些前端代码。

index.js中是一些依赖和配置


