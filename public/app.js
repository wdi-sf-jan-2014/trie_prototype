window.App = {
  Models: {},
  Collections: {},
  Views: {},
  Routers: {},
  initialize: function() {
    App.autocompleter = new Autocompleter();

    var ws = new WebSocket('ws://' + window.location.host + window.location.pathname);
    var searchInterval;
    ws.onopen = function(){
      var running_search = false;
      var timer = function(){
        if(!running_search && q){
          running_search = true;
          view.search(q);
          running_search = false;
        }
      };
      searchInterval = setInterval(timer,50);
    };
    ws.onmessage = function(m) {
      App.autocompleter.add(m.data);
    };
    ws.onclose = function(){
      clearInterval(searchInterval);
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
    $('#results').remove();
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
