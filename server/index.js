const express = require('express');
const app = express();
const port = 3000;

app.get('/', (req, res) =>{
  res.send('hello world');
});

app.get('/qa/questions/:product_id/:page/:count', (req, res)=>{

  res.send(req.params);
});

app.get('/qa/questions/:question_id/answers', (req, res)=>{

  res.send(req.params);
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