var createError = require('http-errors');
var express = require('express');
var mysql=require('mysql');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var ejs=require('ejs');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'ejs');  **注释
//下边两行是新加的
app.engine('.html',ejs.__express);
app.set('view engine','html');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);


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
  console.log('mysql连接成功')
})


//创建数据库
app.get("/createdb",(req,res)=>{
  let sql="CREATE DATABASE nodemysql";
  db.query(sql,(err,result)=>{
    if(err){
      console.log(err);
    }else{
      console.log(result);
      res.send('database create success...');
    }
  })
})

//创建用户信息表user
app.get('/createusertable',(req,res)=>{
  let sql="CREATE TABLE user(id int AUTO_INCREMENT,name VARCHAR(255),phone INT,idcard VARCHAR(255),carnum VARCHAR(255),location VARCHAR(255),password VARCHAR(255),PRIMARY KEY(ID))";
  db.query(sql,(err,result)=>{
    if(err){
      console.log(err);
    }else{
      console.log(result);
      res.send('user表创建成功');
    }
  })
})


//建停车场信息表park
app.get('/createparktable',(req,res)=>{
  let sql="CREATE TABLE park(id int AUTO_INCREMENT,name VARCHAR(255),fnum INT,status VARCHAR(255),PRIMARY KEY(ID))";
  db.query(sql,(err,result)=>{
    if(err){
      console.log(err);
    }else{
      console.log(result);
      res.send('park表创建成功');
    }
  })
})
//park表里插入所有数据
app.get('/addparkposts',(req,res)=>{
  //插入一楼车位信息
  let num=0;
  for(let i=2001;i<=2095;i++){
    let post={name:'车位'+i,fnum:1,status:'free'};
    let sql='INSERT INTO park SET ?';
    db.query(sql,post,(err,result)=>{
      if(err){
        console.log(err);
      }else{
        num++;
        console.log(result);
      }
    })
  }
  //插入二楼车位信息
  for(let i=1001;i<=1102;i++){
    let post={name:'车位'+i,fnum:2,status:'free'};
    let sql='INSERT INTO park SET ?';
    db.query(sql,post,(err,result)=>{
      if(err){
        console.log(err);
      }else{
        num++;
        console.log(result);
      }
    })
  }
})

//创建一个例表posts
app.get('/createpoststable',(req,res)=>{
  let sql="CREATE TABLE posts(id int AUTO_INCREMENT,title VARCHAR(255),body VARCHAR(255),PRIMARY KEY(ID))";
  db.query(sql,(err,result)=>{
    if(err){
      console.log(err);
    }else{
      console.log(result);
      res.send('posts表创建成功');
    }
  })
})

//表里插入数据
app.get('/addposts1',(req,res)=>{
  let post={title:'post one',body:'earth'};
  let sql='INSERT INTO posts SET ?';
  db.query(sql,post,(err,result)=>{
    if(err){
      console.log(err);
    }else{
      console.log(result);
      res.send('posts1 added');
    }
  })
})

//查询内容
app.get('/getposts',(req,res)=>{
  let sql='SELECT * FROM posts';
  db.query(sql,(err,result)=>{
    if(err){
      console.log(err);
    }else{
      console.log(result);
      res.json(result);
      // res.send('查询成功');
    }
  })
})

//查询单条内容,传参数
app.get('/getposts/:id',(req,res)=>{
  let sql=`SELECT * FROM posts WHERE id = ${req.params.id}`;
  db.query(sql,(err,result)=>{
    if(err){
      console.log(err);
    }else{
      console.log(result);
      res.json(result);
    }
  })
})

//更新内容，传参
app.get('/updatepost/:id',(req,res)=>{
  let newTitle='update title';
  let sql=`UPDATE posts SET title = '${newTitle}' WHERE id = ${req.params.id}`;
  db.query(sql,(err,result)=>{
    if(err){
      console.log(err);
    }else{
      console.log(result);
      res.send(`update ${req.params.id} success`);
    }
  })
})

app.listen(8000,function(){
  console.log('8000端口!!');
})


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});


// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
