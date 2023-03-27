const app = require('../server/app');
const request = require("supertest");

// test('adds 1 + 2 to equal 3', () => {
//   expect(1+2).toBe(3);
// });


describe('test getting server responses', ()=>{
  test('get answers', ()=>{
    return request(app)
      .get('/qa/questions/1/answers')
      .then(response =>{
        expect(response.statusCode).toBe(200);
      });
  });
  test('get questions', ()=>{
    return request(app)
      .get('/qa/questions/1/1/1')
      .then(response =>{
        expect(response.statusCode).toBe(200);
      });
  });
});

