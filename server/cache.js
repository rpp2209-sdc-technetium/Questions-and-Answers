module.exports = function Cache () {
  this.storage = {};
  this.find = (id, page, count)=>{
    if (this.storage[id] === undefined) {
      return false;
    } else if (this.storage[id].page !== page || this.storage[id].count !== count){
      return false;
    } else {
      return (this.storage[id].data);
    }

  };
  this.add = (id, page, count, data)=>{
    //delete the last cache
    delete this.storage[Object.keys(this.storage).length - 1];
    //add to cache
    this.storage[id] = {
      page: page,
      count: count,
      data:{...data}
    };
  };
}

