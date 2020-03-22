var express = require('express');
var router = express.Router();
var mysql=require('mysql');
var db=mysql.createConnection({
  host:'localhost',
  user:'root',
  password:'root',
  database:'nodemysql'
})
db.connect(function(err){
  if(err){
    throw err;
  }
  console.log('路由 mysql连接成功')
})

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: '停车场导航系统' });
});
// 登录页
router.get('/login', function(req, res, next) {
  res.render('login', { title: '登录' });
});
//处理登录信息
router.post('/dologin', function(req, res, next) {
  checkFun(req.body.username,req.body.password,res);
});
//查找数据函数
var checkFun=function(phone,pwd,res){
  let sql=`SELECT * FROM user WHERE phone = ${phone}`;
  db.query(sql,(err,result)=>{
    if(err){
      console.log(err);
      res.send('不存在该手机号！');
    }else{
      let user=result[0];
      let realpwd=result[0]['password'];
      let name=result[0]['name'];
      if(pwd==realpwd){
        res.redirect('/home?name='+name);
      }else{
        res.send('密码错误！');
      }
    }
  })
}


// 用户注册页
router.get('/signup', function(req, res, next) {
  res.render('signup', { title: '注册' });
});
//用户信息插入数据库
router.post('/dosignup', function(req, res, next) {
  insertFun(req.body.username,req.body.phone,req.body.idcard,req.body.carnum,req.body.password,res);
});

//把插入数据封装成一个函数
var insertFun=function(name,phone,idcard,car,pwd,res){
  let post={
    name:name,
    phone:phone,
    idcard:idcard,
    carnum:car,
    password:pwd
  };
  let sql="INSERT INTO user SET ?";
  db.query(sql,post,(err,result)=>{
    if(err){
      console.log(err);
      res.send('注册失败！');
    }else{
      console.log(result);
      res.redirect('/login');
    }
  })
}


//用户登录后的页面
router.get('/home', function(req, res, next) {
  //获取单个用户信息
  var some={};
  let sql=`SELECT * FROM user WHERE name = '${req.query.name}'`;
  db.query(sql,(err,result)=>{
    if(err){
      console.log(err);
    }else{
      console.log(result);
      some=result[0];
    }
  })

  //获取park表里的所有信息
  sql=`SELECT * FROM park`;
  db.query(sql,(err,result)=>{
    if(err){
      console.log(err);
      res.send('获取失败');
    }else{
      let obj={};
      for(let i=0;i<result.length;i++){
        obj[result[i]['name']]=result[i];
      }
      // console.log(obj);
      let user=req.query;
      res.render('home', { user:user,obj:obj,some:some});
    }
  })

  
});

//用户选的车位信息时的操作
router.post('/userpark', function(req, res, next) {
  console.log('userpark',req.body);
  //更新park表信息
  let sql=`UPDATE park SET status = '${req.body.status}' WHERE name = '${req.body.name}'`;
  db.query(sql,(err,result)=>{
    if(err){
      console.log(err);
    }else{
      res.statusCode=200;
      console.log('park修改成功');
    }
  })
  //更新user表信息
  sql=`UPDATE user SET location = '${req.body.name}' WHERE name = '${req.body.user}'`;
  db.query(sql,(err,result)=>{
    if(err){
      console.log(err);
      res.statusCode=400;
    }else{
      console.log('user修改成功');
      res.end();
    }
  })
});

//用户离开车位时的操作
router.post('/userfreepark', function(req, res, next) {
  console.log('userfreepark',req.body);
  //更新park表信息
  let sql=`UPDATE park SET status = 'free' WHERE name = '${req.body.location}'`;
  db.query(sql,(err,result)=>{
    if(err){
      console.log(err);
    }else{
      res.statusCode=200;
      console.log('车位离开修改成功');
    }
  })
  //更新user表信息
  sql=`UPDATE user SET location = null WHERE name = '${req.body.name}'`;
  db.query(sql,(err,result)=>{
    if(err){
      console.log(err);
      res.statusCode=400;
    }else{
      console.log('user离开车位修改成功');
      res.end();
    }
  })
});

module.exports = router;
