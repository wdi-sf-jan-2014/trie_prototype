window.App = {
  Models: {},
  Collections: {},
  Views: {},
  Routers: {},
  initialize: function() {
    App.autocompleter = new Autocompleter();

    App.ws = new WebSocket('ws://' + window.location.host + window.location.pathname);
    App.ws.onmessage = function(m) {
      App.autocompleter.add(m.data);
    };
    this.router = new this.Routers.Main();
    Backbone.history.start({pushState: true});
  }
};
$(document).ready(function(){
  App.initialize();
});

App.Routers.Main = Backbone.Router.extend({
  routes: {
    "(:q)": "index",
    "*actions": "index"
  },

  index: function(q){
    var view = new App.Views.Main({ model: {q: q} });
    $('body').html(view.render().el);

    if(q && q !== ''){
      var searchInterval;
      App.ws.onopen = function(){
        var running_search = false;
        var timer = function(){
          if(!running_search && view.$('#search').val() === q){
            running_search = true;
            view.search(q);
            running_search = false;
          }
        };
        searchInterval = setInterval(timer,50);
      };

      App.ws.onclose = function(){
        clearInterval(searchInterval);
        console.log("Done loading.");
      };
    }

  }
});

App.Views.Main = Backbone.View.extend({
  template: Handlebars.compile(
    "<form><input id='search' type=text value='{{q}}''></form><div id='results'></div>"
  ),
  events:{
    "input #search": "searchEvent"
  },
  render: function(){
    this.$el.append(this.template(this.model));
    return this;
  },
  searchEvent: function(event){
      this.search(event.target.value);
  },
  search: function(q){
    Backbone.history.navigate(q);
    $('#results').remove();

    // A good optimization here would be to change the
    // autocompleter.complete function to take a function
    // as a parameter.
    // That function would tell the autocompleter what to do 
    // with each result of the completion search.
    // In this way, we avoid building a giant array of all the results.
    // This would make those sluggish single-letter searches faster.

    var completions = App.autocompleter.complete(q);

    var view = new App.Views.Results({collection: completions});
    this.$el.append(view.render().el);
  }
});
App.Views.Results = Backbone.View.extend({
  id: "results",
  template: Handlebars.compile(
    "Results (max 2000 displayed):" +
    "<ul>" +
    "{{#each this}}" +
    "  <li> <a href='http://en.wikipedia.org/wiki/{{this}}'>{{this}}</a> </li>" +
    "{{/each}}" +
    "</ul>"
  ),
  render: function(){
    this.$el.html(this.template(this.collection.slice(0,2000)));
    return this;
  }
});
