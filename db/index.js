const mysql = require('mysql2');
const Cache =  require('./cache.js');

require('dotenv').config();

const connection = mysql.createConnection({
  host: process.env.DBURL,
  user: 'root',
  database: 'qna_service'
});


var db = {};

var AnswerCache = new Cache(200);
var QuestionCache = new Cache(200);

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

db.getAnswers = (questionID)=>{
  return new Promise ((fulfill, reject)=>{
    connection.query(`SELECT * FROM answers WHERE questionID = "${questionID}"`, (err, results, fields)=>{
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

helpers.getQuestions = (productID, page, count)=>{

  var data = {
    product_id: productID,
    results: []
  };

  function QuestionObj (question, answers){
    this.question_id = question.id;
    this.question_body = question.body;
    this.question_date = question.date;
    this.asker_name = question.asker_name;
    this.question_helpfulness = question.helpfuless;
    this.reported = new Boolean(question.reported);
    this.answers = {};

    for (var x = 0; x < answers.results.length; x++) {
      this.answers[answers.results[x].answer_id] = { id: answers.results[x].answer_id, ...answers.results[x]};
      delete this.answers[answers.results[x].answer_id].answer_id;
    }

  };

  return new Promise((fulfill, reject)=>{

    //check if the product is cached
    var cachedData = QuestionCache.find(productID);
    if (cachedData) {
      fulfill({
        ...cachedData,
         results: cachedData.results.slice((page * count) - count, (page * count))
        });
    } else {
      //get all the questions
      db.getQuestions(productID)
      .then((questions)=>{

        //loop through the questions
        var loop = (x, callback)=>{
          if (x < questions.length && questions[x] !== undefined) {
            //get the answers for the current question
            helpers.getAnswers(questions[x].id)
            .then((answers)=>{
              data.results.push(new QuestionObj(questions[x], answers));
              loop(x + 1, callback);
            });
          } else {
            callback();
          }
        };

        loop(0, ()=>{
          QuestionCache.add(productID, data);
          fulfill({
            ...data,
             results: data.results.slice((page * count) - count, (page * count))
            });
        });
      });
    }

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

    var cachedData = AnswerCache.find(questionID);

    if (cachedData) {
      fulfill(cachedData);
    } else {
      //get the answers for the desired question
      db.getAnswers(questionID)
      .then((answers)=>{

        if (answers.length > 0) {
          //get the photos for each answer
          //generate the query
          var condition = ``;

          //loop through the answers
          for (var x = 0; x < answers.length; x++) {
            data.results.push(new AnswerObj(answers[x]));
            condition = condition.concat(`answerID = ${answers[x].id} || `);
          }


          //remove the last comma
          condition = condition.slice(0, condition.length - 3);

          //get all the photos for all the answers
          db.getPhotos(condition)
          .then((photos)=>{
            //add the photos to their respective answer
            photosObj = {};
            for (var x = 0; x < photos.length; x++) {
              if (photosObj[photos[x].answerID] === undefined) {
                photosObj[photos[x].answerID] = [{id: photos[x].id, url: photos[x].url}];
              } else {
                photosObj[photos[x].answerID].push({id: photos[x].id, url: photos[x].url});
              }
            }

            //loop through the answers
            for (var x= 0; x < data.results.length; x++) {
              if (photosObj[data.results[x].answer_id] !== undefined) {
                data.results[x].photos = photosObj[data.results[x].answer_id];
              }
            }

            AnswerCache.add(questionID, data);
            fulfill(data);
          });
        } else {
          AnswerCache.add(questionID, data);
          fulfill(data);
        }

      });
    }


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