module.exports = function Cache (max = 100) {
  this.storage = {};
  this.count = {};
  this.least = {id : 0, count: 0};
  this.max = max;


  this.find = (id)=>{
    //add the lookup to the count object
    if (this.count[id] === undefined) {
      this.count[id] = 1;
    } else {
      this.count[id]++;
    }

    if (this.storage[id] === undefined) {
      return false;
    } else {
      return (this.storage[id]);
    }

  };



  this.add = (id, data)=>{



    //if we have max cached values
    if (Object.keys(this.storage).length > this.max) {
      //check if the current data lookup's count is the same as our least looked up data
      if (this.count[id] === this.least.count) {
        //delete the least lookedup data from cache
        delete this.storage[this.least.id];
        //make the least our current data
        this.least.id = id;
        this.least.count = this.count[id];
        //add current data to cache
        this.storage[id] = {
          ...data
        };
      }
    } else {
      this.storage[id] = {
        ...data
      };
      if (this.count[id] < this.least.count) {
        this.least.id = id;
        this.least.count = this.count[id];
      }
    }

  };
}

