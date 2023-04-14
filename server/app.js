const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const path = require('node:path');
require('dotenv').config();

const helpers = require('../db/index.js');


app.use(bodyParser.json());



app.get('/', (req, res) =>{
  res.send('hello world');
});

app.get(`/${process.env.LOADERIO}`, (req, res)=>{
  if (process.env.LOADERIO !== '') {
    res.sendFile(path.join(__dirname, `${process.env.LOADERIO}.txt`));
  }
});

app.get('/qa/questions/:product_id/:page/:count', (req, res)=>{

  helpers.getQuestions(req.params.product_id, req.params.page, req.params.count)
  .then((results)=>{
    res.send(results);
  })
});

app.get('/qa/questions/:question_id/answers', (req, res)=>{

  helpers.getAnswers(req.params.question_id)
  .then((results)=>{
    res.send(results);
  });
});

app.post('/qa/questions',(req, res)=>{
  helpers.addQuestion(req.body)
  .then(()=>{
    res.send('success');
  });
});

app.post('/qa/questions/:question_id/answers', (req, res)=>{
  helpers.addAnswer(req.params.question_id, req.body)
  .then((response)=>{
    res.send(response);
  });
});

app.put('/qa/questions/:question_id/helpful', (req, res)=>{

  helpers.feedback(req.params.question_id, 'questions', 'helpfulness')
  .then(()=>{
    res.send('success');
  });
});

app.put('/qa/questions/:question_id/report', (req, res)=>{

  helpers.feedback(req.params.question_id, 'questions', 'reported')
  .then(()=>{
    res.send('success');
  });});

app.put('/qa/questions/:answer_id/helpful', (req, res)=>{

  helpers.feedback(req.params.question_id, 'answers', 'helpfulness')
  .then(()=>{
    res.send('success');
  });});

app.put('/qa/questions/:answer_id/report', (req, res)=>{

  helpers.feedback(req.params.question_id, 'answers', 'reported')
  .then(()=>{
    res.send('success');
  });});

module.exports = app;