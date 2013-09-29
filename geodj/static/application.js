var GlobalState = Backbone.Model.extend({
  defaults: {
    nextDisabled: false
  }
});

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

var Video = Backbone.Model.extend({
  videoId: function() {
    var vid = this.get('url').split('v=')[1];
    if (vid.indexOf("&") === -1) return vid;
    else return vid.split("&")[0];
  }
});

var Videos = Backbone.Collection.extend({
  model: Video
});

var KeyboardShortcutsView = Backbone.View.extend({
  el: 'body',

  events: {
    'keydown': 'onKeyDown'
  },

  Keys: {
    RIGHT_ARROW: 39
  },

  onKeyDown: function(e) {
    switch(e.keyCode) {
      case this.Keys.RIGHT_ARROW:
        if(!globalState.get('nextDisabled')) {
          countries.selectNextModel();
          break;
        }
    }
  }
});

var PlayerView = Backbone.View.extend({
  el: '.player',

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
    this.disableNextButton();
    var country = countries.selected();
    this.$countryTitle.text(country.get('fields')['name']);
    this.$artistTitle.text("");

    var _this = this;
    country.fetchVideos(function(artist, videos) {
      var video = videos.first();
      if(!video) window.location.reload();
      _this.$artistTitle.text(artist);
      _this.enableNextButton();
    });
  },

  next: function() {
    if (globalState.get('nextDisabled')) return;
    countries.selectNextModel();
  },

  disableNextButton: function() {
    globalState.set('nextDisabled', true);
    this.$nextButton.prop('disabled', true);
  },

  enableNextButton: function() {
    globalState.set('nextDisabled', false);
    this.$nextButton.prop('disabled', false);
  },

  onPlayStateChange: function(data) {
    console.log("state", data);
  }
});

window.onYouTubeIframeAPIReady = function() {
  var ytPlayer;
  window.playerView = new PlayerView();

  onPlayerReady = function() {
    playerView.play();
    new KeyboardShortcutsView();

    ytPlayer.addEventListener("onStateChange", function(state) {
      playerView.onPlayStateChange(state['data']);
    });
  };

  ytPlayer = new YT.Player("yt-player", {
    height: '100%',
    width: '100%',
    playerVars: {
      controls: 0,
      showinfo: 0 ,
      modestbranding: 1,
      wmode: "opaque"
    },
    events: {
      'onReady': onPlayerReady
    }
  });
};
