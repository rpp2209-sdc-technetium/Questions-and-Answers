const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: '127.0.0.1',
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

db.getPhotos = (answerID)=>{
  return new Promise ((fulfill, reject)=>{
    connection.query(`SELECT * FROM photos WHERE answerID = "${answerID}"`, (err, results, fields)=>{
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

  function QuestionObj (question, answers){
    this.question_id = question.id;
    this.question_body = question.body;
    this.question_date = new Date(parseInt(question.date)).toISOString();
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
    //get all the questions
    db.getQuestions(productID)
    .then((questions)=>{

      //loop through the questions
      var loop = (x, callback)=>{
        if (x < questions.length) {
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

      loop(0, ()=>{fulfill(data);});
    });
  });
};

helpers.getAnswers = (questionID)=>{

  function AnswerObj (answer, photos){
    this.answer_id = answer.id;
    this.body = answer.body;
    this.date = new Date(parseInt(answer.date)).toISOString();
    this.answerer_name = answer.answerer_name;
    this.helpfuless = answer.helpfulness;
    this.photos = [];
    for (var x = 0; x < photos.length; x++) {
      this.photos.push({id: photos[x].id, url: photos[x].url});
    }
  };

  return new Promise ((fulfill, reject)=>{

    var data = {
      question: questionID,
      results: []
    };

    //get the answers for the desired question
    db.getAnswers(questionID)
    .then((answers)=>{
      //loop through the returned answers

      var loop = (x, callback)=>{
        if (x < answers.length) {
          db.getPhotos(answers[x].id)
          .then((photos)=>{
            data.results.push(new AnswerObj(answers[x], photos));
            loop(x + 1, callback);
          });
        } else {
          callback();
        }
      };

      loop(0, ()=>{fulfill(data);});


    });
  });
};

module.exports = helpers;