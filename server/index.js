const express = require('express');
const app = express();
const port = 3000;

const helpers = require('../db/index.js');

app.get('/', (req, res) =>{
  res.send('hello world');
});

app.get('/qa/questions/:product_id/:page/:count', (req, res)=>{

  helpers.getQuestions(req.params.product_id)
  .then((results)=>{
    res.send(results);
  });

  //res.send(req.params);
});

app.get('/qa/questions/:question_id/answers', (req, res)=>{

  helpers.getAnswers(req.params.question_id)
  .then((results)=>{
    res.send(results);
  });
});

app.post('/qa/questions',(req, res)=>{
  res.send('hello');
});

app.post('/qa/questions/:question_id/answers', (req, res)=>{

  res.send(req.params);
});

app.put('/qa/questions/:question_id/helpful', (req, res)=>{

  res.send(req.params);
});

app.put('/qa/questions/:question_id/report', (req, res)=>{

  res.send(req.params);
});

app.put('/qa/questions/:answer_id/helpful', (req, res)=>{

  res.send(req.params);
});

app.put('/qa/questions/:answer_id/report', (req, res)=>{

  res.send(req.params);
});

app.listen(port, ()=>{
  console.log('On port ', port);
});