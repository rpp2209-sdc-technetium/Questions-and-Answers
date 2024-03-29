const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const Cache =  require('./cache.js');
const path = require('node:path');
require('dotenv').config();

const Redis = require('redis');
const client = Redis.createClient();

client.on('error', err => console.log('Redis Client Error', err));

client.connect();

const helpers = require('../db/index.js');


app.use(bodyParser.json());



app.get('/', (req, res) =>{
  res.send('hello world');
});

app.get(`/${process.env.LOADERIO}`, (req, res)=>{
  if (process.env.LOADERIO !== '') {
    res.send(process.env.LOADERIO);
  }
});

app.get('/qa/questions/:product_id/:page/:count',(req, res)=>{

  client.get(`${req.params.product_id}Q`)
  .then((data)=>{
    if (data !== null) {
      console.log('cached');
      res.send(JSON.parse(data));
    } else {
      console.log('not cached');
      helpers.getQuestions(req.params.product_id)
      .then((data)=>{
        res.send(data);
        client.set(`${req.params.product_id}Q`, JSON.stringify(data), {EX: 2});
      })
    }
  });

  // if (data) {
  //   res.send(data);
  //   //res.send({...data, results: data.results.slice((req.params.page * req.params.count) - req.params.count, (req.params.page * req.params.count)) });
  // } else {
  //   helpers.getQuestions(req.params.product_id)
  // .then((data)=>{
  //   QuestionCache.add(req.params.product_id, data);
  //   res.send(data);
  //   //res.send({...data, results: data.results.slice((req.params.page * req.params.count) - req.params.count, (req.params.page * req.params.count)) });

  // })
  // }

  //res.send(req.params);
});

app.get('/qa/questions/:question_id/answers', (req, res)=>{

  client.get(`${req.params.question_id}A`)
  .then((data)=>{
    if (data !== null) {
      console.log('cached');
      res.send(JSON.parse(data));
    } else {
      console.log('not cached')
      helpers.getAnswers(req.params.question_id)
      .then((data)=>{
        res.send(data);
        client.set(`${req.params.question_id}A`, JSON.stringify(data), {EX: 2});

      });
    }
  });




  // var data = AnswerCache.find(req.params.question_id);

  // if (data) {
  //   res.send(data);
  // } else {
  //   helpers.getAnswers(req.params.question_id)
  // .then((data)=>{
  //   AnswerCache.add(req.params.question_id, data);
  //   res.send(data);
  // });
  // }

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