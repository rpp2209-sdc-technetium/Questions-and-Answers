const app = require('../server/app');
const request = require("supertest");

const Cache = require('../server/cache.js');

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

describe('cache', ()=>{
  var caches = new Cache(3);
  test('cache.add adds a new record to cache ', ()=>{
    expect(caches.find(1, 1, 1)).toBe(false);
    caches.add(1, 1, 1, {'hello': 'world'});
    expect(caches.find(1, 1, 1)).toStrictEqual({'hello':'world'});
  });
  test('cache should keep the top 3 most looked up entries', ()=>{
    caches.find(2, 2, 2);
    caches.find(3, 3, 3);
    caches.find(4, 4, 4);
    caches.add(2, 2, 2, {'bob':'obo'});
    caches.add(3, 3, 3, {'steve':'john'});
    caches.add(4, 4, 4, {'motor':'cycle'});
    caches.add(5, 5, 5, {'mouse':'cat'});

    expect(caches.find(5, 5, 5)).toBe(false);



  });
});

