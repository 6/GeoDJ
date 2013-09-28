var Country = Backbone.Model.extend({
  defaults: {
    selected: false
  },

  fetchVideos: function (complete) {
    $.ajax({
      url: "/countries/" + this.get('pk') + '/videos',
      success: function(json) {
        complete(json['artist'], new Videos(json['results']));
      }
    });
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

var Video = Backbone.Model.extend({});

var Videos = Backbone.Collection.extend({
  model: Video
});

var PlayerView = Backbone.View.extend({
  el: '.player',
  nextButtonDisabled: false,

  events: {
    'click .next-song': 'next'
  },

  initialize: function() {
    this.$nextButton = this.$el.find(".next-button");
    this.$countryTitle = this.$el.find(".country-title");
    this.$artistTitle = this.$el.find(".artist-title");
    var _this = this;
    countries.on("change:selected", function() {
      _this.play();
    });
  },

  play: function() {
    var country = countries.selected();
    this.$countryTitle.text(country.get('fields')['name']);
    this.$artistTitle.text("");

    var _this = this;
    country.fetchVideos(function(artist, videos) {
      var video = videos.shuffle()[0];
      _this.$artistTitle.text(artist);
      _this.enableNextButton();
    });
  },

  next: function() {
    if (this.nextButtonDisabled) return;
    this.disabledNextButton();
    countries.selectNextModel();
  },

  disabledNextButton: function() {
    this.nextButtonDisabled = true;
    this.$nextButton.prop('disabled', true);
  },

  enableNextButton: function() {
    this.nextButtonDisabled = false;
    this.$nextButton.prop('disabled', false);
  }
});
