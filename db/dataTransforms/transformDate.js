
//get database connection
const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: '127.0.0.1',
  user: 'root',
  database: 'qna_service'
});


var loop = (x, length, cb)=>{
  if (x === length || x > 7000000) {
    console.log(x);
    console.log('complete');
    return;
  }
  else {
    connection.query(`SELECT date FROM answers where id = ${x}`, (err, results, fields)=>{
      if (err) {
        return err;
      } else {

        //check that there is data there
        if (results.length > 0) {
          //current date = results[0][date]
          //new Date(parseInt(results[0]['date'])).toISOString();
          //new Date(results[0]['date']).getTime();
          var newDate = new Date(parseInt(results[0]['date'])).toISOString();

          connection.query(`UPDATE answers SET date = '${newDate}' where id = ${x}`, (err, results, fields)=>{
            if (err) {
              return err;
            } else {
              if (x % 50000 === 0) {
                console.log(x);
              }
              loop(x + 1, length);
            }
          })
        }
        else {
          console.log('FAIL', x);
        }

      }
    });
  }
};


//get the number of entries there are in the questions table

connection.query(`select count(*) from answers`, (err, results, fields)=>{
  if (err) {
    console.log(err);
  } else {
    var length = results[0][`count(*)`];
    loop(4000001, length);
  }
});
