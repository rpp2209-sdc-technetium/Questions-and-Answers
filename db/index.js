const mysql = require('mysql2');
require('dotenv').config();

const connection = mysql.createConnection({
  host: process.env.DBURL,
  user: 'root',
  database: 'qna_service'
});


var db = {};

db.getQuestions = (productID)=>{
  return new Promise ((fulfill, reject)=>{
    connection.query(`SELECT * FROM questions WHERE productID = "${productID}"`, (err, results, fields)=>{
      if (err) {
        reject(err);
      } else {
        fulfill(results);
      }
    });
  });
};

db.getAnswers = (condition)=>{
  return new Promise ((fulfill, reject)=>{
    connection.query(`SELECT * FROM answers WHERE ${condition}`, (err, results, fields)=>{
      if (err) {
        reject(err);
      } else {
        fulfill(results);
      }
    });
  });
};

db.getPhotos = (condition)=>{
  return new Promise ((fulfill, reject)=>{
    connection.query(`SELECT * FROM photos WHERE ${condition}`, (err, results, fields)=>{
      if (err) {
        reject(err);
      } else {
        fulfill(results);
      }
    });
  });
};



var helpers = {};

helpers.getQuestions = (productID)=>{

  var data = {
    product_id: productID,
    results: []
  };

  function QuestionObj (question){
    this.question_id = question.id;
    this.question_body = question.body;
    this.question_date = question.date;
    this.asker_name = question.asker_name;
    this.question_helpfulness = question.helpfuless;
    this.reported = new Boolean(question.reported);
    this.answers = {};
  };

  function AnswerObj (answer){
    this.id = answer.aID;
    this.body = answer.abody;
    this.date = answer.adate;
    this.answerer_name = answer.answerer_name;
    this.helpfuless = answer.ahelpfulness;
    this.photos = [];
  };

  return new Promise((fulfill, reject)=>{
    //get all the questions
    var columns = `
    questions.id, questions.body, questions.date, questions.asker_name, questions.reported, questions.helpfulness,
    answers.id AS aID, answers.body AS abody, answers.date AS adate, answers.answerer_name, answers.reported AS areported, answers.helpfulness AS ahelpfulness,
    photos.id AS pID, photos.url`;

    connection.query(`
    SELECT ${columns}
     FROM (questions
      LEFT JOIN answers ON answers.questionID = questions.id)
      LEFT JOIN photos ON photos.answerID = answers.id
      WHERE questions.productID = ${productID}`
      ,(err, results, fields)=>{
        if (err) {
          reject(err);
        } else {
          var formatedQ = {};

          for (var x = 0; x < results.length; x++) {
            var currentQID = results[x].id;
            var currentAID = results[x].aID;

            if (formatedQ[currentQID] === undefined) {
              formatedQ[currentQID] = new QuestionObj(results[x]);
            }
            if (currentAID !== null) {
              if (formatedQ[currentQID].answers[currentAID] === undefined) {
                formatedQ[currentQID].answers[currentAID] = new AnswerObj(results[x]);
              }
            }

            if (results[x].pID !== null) {
              formatedQ[currentQID].answers[currentAID].photos.push({id: results[x].pID, url: results[x].url});
            }
          }

          for (var key in formatedQ) {
            data.results.push(formatedQ[key]);
          }

          console.log(results);
          fulfill(data);
        }
      });
  });
};

helpers.addQuestion = (qInfo)=>{
  return new Promise ((fulfill, reject)=>{
    connection.query(
      `INSERT INTO Questions (productID, body, date, asker_name, asker_email, reported, helpfulness) VALUES (${qInfo.product_id}, '${qInfo.body}', '${new Date().toISOString()}', '${qInfo.name}', '${qInfo.email}', 0, 0);`
    , (err, results, fields)=>{
      if (err) {
        reject(err);
      } else {
        fulfill();
      }
    });
  });
};

helpers.getAnswers = (questionID)=>{

  function AnswerObj (answer){
    this.answer_id = answer.id;
    this.body = answer.body;
    this.date = answer.date;
    this.answerer_name = answer.answerer_name;
    this.helpfuless = answer.helpfulness;
    this.photos = [];
  };

  return new Promise ((fulfill, reject)=>{

    var data = {
      question: questionID,
      results: []
    };

    var columns = 'answers.id, answers.body, answers.date, answers.answerer_name, answers.reported, answers.helpfulness, photos.id AS photoID, photos.url';

    connection.query(`SELECT ${columns} FROM answers LEFT JOIN photos ON answers.id = photos.answerID WHERE answers.questionID = ${questionID};`,
    (err, results, fields)=>{
      if (err) {
        reject(err);
      } else {

        var answers = {};

        console.log(results);

        //format all our answers
        //loop through the results
        for (var x = 0; x < results.length; x++) {
          var currentID = results[x].id;
          if (answers[currentID] === undefined) {
            answers[currentID] = new AnswerObj(results[x]);
          }
          if (results[x].url !== null) {
            answers[currentID].photos.push({id: results[x].photoID, url:results[x].url});
          }
        }

        //loop through our answers object and add them to our data response
        for (var key in answers) {
          data.results.push(answers[key]);
        }

        fulfill(data);
      }
    });
  });
};

helpers.addAnswer = (questionID, aInfo)=>{
  return new Promise ((fulfill, reject)=>{
    //first add the answers
    connection.query(`INSERT INTO Answers (questionID, body, date, answerer_name, answerer_email, reported, helpfulness) VALUES (${questionID}, '${aInfo.body}','${new Date().toISOString()}','${aInfo.name}', '${aInfo.email}', 0, 0);`
    , (err, results, fields)=>{
      if (err) {
        reject(err);
      } else {
        var loop = (x, callback)=>{
          if (x >= aInfo['photos'].length) {
            callback();
          } else {
            helpers.addPhoto(answerID, aInfo['photos'][x])
            .then(()=>{
              loop(x+1, callback);
            });
          }
        };

        //get the id of the answer we just added
        db.getAnswers(questionID)
        .then((data)=>{
          answerID = data[data.length - 1].id
          loop(0, ()=>{fulfill('sucess')});
        });

        //add the photos
      }
    });
  });
};

helpers.addPhoto = (answerID, url) => {
  return new Promise ((fulfill, reject)=>{
    connection.query(`INSERT INTO photos (answerID, url) VALUES (${answerID}, '${url}');`
    , (err, results, fields)=>{
      if (err) {
        reject(err);
      } else {
        fulfill();
      }
    });
  });
};

helpers.feedback = (id,QorA, type)=>{
  return new Promise ((fulfill, reject)=>{
    if (type === 'reported') {
      connection.query(`UPDATE ${QorA} SET reported = 1 WHERE id = ${id}`
      , (err, results, fields)=>{
        if (err) {
          reject('database error', err);
        } else {
          fulfill();
        }
      });
    } else {
      //get the current helpfulness count
      connection.query(`SELECT helpfulness FROM ${QorA} WHERE id = ${id}`
      , (err, results, fields)=>{
        if (err) {
          reject(err);
        } else {
          var helpfulness = results[0].helpfulness;

          connection.query(`UPDATE ${QorA} SET helpfulness = ${helpfulness + 1} WHERE id = ${id}`
          , (err, results, fields)=>{
            if (err) {
              reject('database error', err);
            } else {
              fulfill();
            }
          });
        }
      });
    }
  });
};

module.exports = helpers;