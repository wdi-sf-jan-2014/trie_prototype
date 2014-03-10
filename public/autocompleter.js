Autocompleter = function(){
  this.data = new NiceTrie();
  // this.data = [];
};

Autocompleter.prototype.complete = function(prefix){
  return this.data.autoComplete(prefix);
  // return this.data.filter(function(str){
  //    return str.substring(0,prefix.length).toLowerCase() === prefix;
  // });
};

Autocompleter.prototype.add = function(word){
  this.data.learn(word);
  // this.data.push(word);
};