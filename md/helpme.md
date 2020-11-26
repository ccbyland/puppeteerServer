# Mongodb常用操作

> 数据库连接
```shell
切换到mongodb数据库
cd /usr/local/mongodb/bin

打开mongodb数据库
./mongo
```
> 库操作
```shell
查看所有表
show dbs

选择当前数据库
use 数据库名

删除当前数据库
db.dropDatabase()

查看当前所在数据库
db
```
> 表操作
```shell
查看当前数据库所有表
show collections

查询
db.表名.find()

计数
db.表名.count()

删除
db.表名.drop()
```

# Mongodb常见问题
非正常关闭导致锁库

```shell
重启服务
cd /usr/local/mongodb/bin
./mongod --dbpath /usr/local/var/mongodb --logpath /usr/local/var/log/mongodb/mongo.log --fork

删除lock文件
cd /usr/local/var/mongodb
rm -rf ./mongod.lock
```