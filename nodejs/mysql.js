var mysql  = require('mysql');
// 연결 정보를 담고 연결 만들기 
var connection = mysql.createConnection({
    host : 'localhost',
    user : 'root',
    password : '111111',
    database : 'opentutorials'
});

// 연결 실행
connection.connect();
//SQL 실행 후 콜백함수가 실행된다. 
var sql = 'select * from topic';
// 콜백함수 인자 : 에러, 성공인 경우의 sql결과, 
connection.query(sql, function(error, results, fields){
    if(error){
        console.log(error);
    }
    console.log(results);
});

//연결 종료
connection.end();
