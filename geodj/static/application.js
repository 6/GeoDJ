var Country = Backbone.Model.extend({
  defaults: {
    selected: false
  }
});

var Countries = Backbone.Collection.extend({
  model: Country,

  initialize: function() {
    this.on('add remove reset', this.selectFirstIfNoSelection);
  },

  selected: function() {
    return this.find(function(country) { return country.get('selected'); });
  },

  selectFirstIfNoSelection: function() {
    if(!this.selected()) this.first().set('selected', true);
  },

  selectNextModel: function() {
    this.selectModel(this.indexOf(this.selected()) + 1);
  },

  selectModel: function(index) {
    if (this.selected()) this.selected().set('selected', false, {silent: true});
    if (index > this.size() - 1) index = 0;
    if (index < 0) index = this.size() - 1;
    this.at(index).set('selected', true);
  }
});

var PlayerView = Backbone.View.extend({
  el: '.player',

  events: {
    'click .next-song': 'next'
  },

  initialize: function() {
    this.$countryTitle = this.$el.find(".country-title");
    this.$artistTitle = this.$el.find(".artist-title");
    var _this = this;
    countries.on("change:selected", function() {
      _this.play();
    });
  },

  play: function() {
    this.$countryTitle.text(countries.selected().get('fields')['name']);
  },

  next: function() {
    countries.selectNextModel();
  }
});
