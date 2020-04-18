var http = require('http');
var fs = require('fs');
var url = require('url');
var qs = require('querystring');
var template = require('./lib/template.js');
var path = require('path');
var sanitizeHtml = require('sanitize-html');
var mysql = require('mysql');

var db = mysql.createConnection({
  host : 'localhost',
  user : 'root',
  password: '111111',
  database : 'opentutorials'
});

db.connect();

var app = http.createServer(function(request,response){
    var _url = request.url;
    var queryData = url.parse(_url, true).query;
    var pathname = url.parse(_url, true).pathname;
    if(pathname === '/'){
      if(queryData.id === undefined){

       var sql = 'select * from topic';
       db.query(sql, function(error, topics){
         console.log(topics);

         var title = 'Welcome';
         var description = 'Hello, Node.js';

         var list = template.list(topics);
         var html = template.HTML(title, list,
           `<h2>${title}</h2>${description}`,
           `<a href="/create">create</a>`
         );

         response.writeHead(200);
         response.end(html);
       });

      } else { // 상세보기 
       var sql = 'select * from topic';
       db.query(sql, function(error, topics){

        // 에러처리
        if(error){
          throw error; //에러를 콘솔에 보여주고 애플리케이션 중지시킴.
        }

         // id에 해당하는 queryData.id
         var id_sql = `select * from topic where id =?`
         db.query(id_sql, [queryData.id],  function(error2, topic){
          // 에러처리
          if(error2){
            throw error2; //에러를 콘솔에 보여주고 애플리케이션 중지시킴.
          }

          var title = topic[0].title;
          var description = topic[0].description;
 
          var list = template.list(topics);
          var html = template.HTML(title, list,
            `<h2>${title}</h2>${description}`,
            ` <a href="/create">create</a>
              <a href="/update?id=${queryData.id}">update</a>
              <form action="delete_process" method="post">
                <input type="hidden" name="id" value="${queryData.id}">
                <input type="submit" value="delete">
              </form>`
          );
 
          response.writeHead(200);
          response.end(html);

         });
       });
        

      }
    } else if(pathname === '/create'){  // 글 생성 

      var select_sql = 'select * from topic';
      db.query(select_sql, function(error, topics){
        var title = 'Create';
        var list = template.list(topics);
        var html = template.HTML(title, list,
          `  
            <form action="/create_process" method="post">
              <p><input type="text" name="title" placeholder="title"></p>
              <p> <textarea name="description" placeholder="description"></textarea></p>
              <p> <input type="submit"> </p>
            </form>
          `,
          `<a href="/create">create</a>`
        );

        response.writeHead(200);
        response.end(html);
      });



    } else if(pathname === '/create_process'){ // INSERT 처리 

      var body = '';
      request.on('data', function(data){
          body = body + data;
      });
      request.on('end', function(){
          var post = qs.parse(body);

          var insert_sql = `insert into topic (title, description, created, author_id) \
            values(?, ?, NOW(), ?)`;

          db.query(insert_sql, [post.title, post.description, 1], 
            function(error, topics){
          
              if(error){
                throw error;
              }
            // DB에 삽입한 행의 id 값 : insertId
            response.writeHead(302, {Location: `/?id=${topics.insertId}`});
            response.end();
          });

      });


    } else if(pathname === '/update'){ // DB UPDATE
      
      var select_sql = 'select * from topic';
      db.query(select_sql, function(error, topics){
        if(error){ throw error;}

        var id_sql = `select * from topic where id =?`
        db.query(id_sql, [queryData.id],  function(error2, topic){
          
          if(error2){ throw error2;}

          var list = template.list(topics);
          var html = template.HTML(topic[0].title, list,
            `
            <form action="/update_process" method="post">
              <input type="hidden" name="id" value="${topic[0].id}">
              <p><input type="text" name="title" placeholder="title" value="${topic[0].title}"></p>
              <p>
                <textarea name="description" placeholder="description">${topic[0].description}</textarea>
              </p>
              <p>
                <input type="submit">
              </p>
            </form>
            `,
            `<a href="/create">create</a> <a href="/update?id=${topic[0].id}">update</a>`
          );
          response.writeHead(200);
          response.end(html);
        });
        
      });
    
    
    } else if(pathname === '/update_process'){   // 수정 처리 
      var body = '';
      request.on('data', function(data){
          body = body + data;
      });
      request.on('end', function(){
          var post = qs.parse(body);

          var update_sql = 'update topic set title=?, description=?, author_id=1 \
                        where id = ?';
          db.query(update_sql, [post.title, post.description, post.id], function(error, topic){
            response.writeHead(302, {Location: `/?id=${post.id}`});
            response.end();  
          });

      });

    } else if(pathname === '/delete_process'){
      var body = '';
      request.on('data', function(data){
          body = body + data;
      });
      request.on('end', function(){
          var post = qs.parse(body);
          var id = post.id;
          var filteredId = path.parse(id).base;
          /*
          fs.unlink(`data/${filteredId}`, function(error){
            response.writeHead(302, {Location: `/`});
            response.end();
          })
          */
      });
    } else {
      response.writeHead(404);
      response.end('Not found');
    }
});
app.listen(3000);
