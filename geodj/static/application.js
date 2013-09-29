var GlobalState = Backbone.Model.extend({
  defaults: {
    nextDisabled: false,
    continent: 'all',
    history: [],
    historyIndex: -1
  },

  pushHistory: function(data) {
    this.get('history').push(data);
    this.set('historyIndex', this.get('historyIndex') + 1);
  },

  back: function() {
    if (!this.hasPreviousHistory()) return;
    this.set('historyIndex', this.get('historyIndex') - 1);
    var data = this.get('history')[this.get('historyIndex')];
    this.set('continent', data.continent, {silent: true});
    countries.clearSelectedSilent();
    data.country.set('selected', {silent: true});
    this.trigger('change:history', data);
  },

  forward: function() {
    if (!this.hasNextHistory()) return;
    this.set('historyIndex', this.get('historyIndex') + 1);
    var data = this.get('history')[this.get('historyIndex')];
    this.set('continent', data.continent, {silent: true});
    countries.clearSelectedSilent();
    data.country.set('selected', {silent: true});
    this.trigger('change:history', data);
  },

  hasPreviousHistory: function() {
    return this.get('historyIndex') >= 1;
  },

  hasNextHistory: function() {
    return (this.get('historyIndex') + 1) <= (this.get('history').length - 1);
  },

  resetHistory: function() {
    this.set('historyIndex', -1);
    this.set('history', []);
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
        if(!json) return playerView.handleNoVideos();
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

  inContinent: function(continent) {
    return new Countries(countries.filter(function(country) {
      return country.get('fields')['continent'] === continent;
    }));
  },

  selected: function() {
    return this.find(function(country) { return country.get('selected'); });
  },

  clearSelectedSilent: function() {
    if (this.selected()) this.selected().set('selected', false, {silent: true});
  },

  selectFirstIfNoSelection: function() {
    if(!this.selected()) this.first().set('selected', true);
  },

  selectPreviousModel: function() {
    globalState.back();
  },

  selectNextModel: function() {
    if (globalState.hasNextHistory()) return globalState.forward();
    var nextModel = null;
    if (globalState.get('continent') === 'all') {
      nextModel = this.modelAtIndex(this.indexOf(this.selected()) + 1);
    }
    else {
      var continentCountries = this.inContinent(globalState.get('continent'));
      if (continentCountries.selected()) {
        nextModel = continentCountries.modelAtIndex(continentCountries.indexOf(this.selected()) + 1);
      }
      else {
        nextModel = continentCountries.shuffle()[0];
      }

    }
    this.clearSelectedSilent();
    nextModel.set('selected', true);
  },

  modelAtIndex: function(index) {
    if (index > this.size() - 1) index = 0;
    if (index < 0) index = this.size() - 1;
    return this.at(index);
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
    SPACEBAR: 32,
    LEFT_ARROW: 37,
    RIGHT_ARROW: 39
  },

  onKeyDown: function(e) {
    switch(e.keyCode) {
      case this.Keys.RIGHT_ARROW: playerView.next(); break;
      case this.Keys.LEFT_ARROW: playerView.previous(); break;
      case this.Keys.SPACEBAR: playerView.togglePlay(); break;
    }
  }
});

var PlayerView = Backbone.View.extend({
  el: '.player',

  events: {
    'click .toggle-play': 'togglePlay',
    'click .next-song': 'next'
  },

  initialize: function() {
    this.$togglePlayButton = this.$el.find(".toggle-play");
    this.$nextButton = this.$el.find(".next-button");
    this.$countryTitle = this.$el.find(".country-title");
    this.$artistTitle = this.$el.find(".artist-title");
    this.$slider = this.$el.find(".seek-slider");
    this.$youtubeLink = this.$el.find(".youtube-link");
    var _this = this;
    countries.on("change:selected", function() {
      _this.play();
    });
    globalState.on("change:continent", function() {
      _this.next();
    });
    globalState.on("change:history", function(historyData) {
      _this.play(historyData);
    });

    this.$slider.slider({
      range: "min",
      value: 0,
      min: 0,
      max: 1,
      slide: function(e, ui) {
        ytPlayer.seekTo(parseInt(ui.value));
      }
    });
    // Disable arrow key control of slider
    this.$slider.off('keydown');

    setInterval(function() {
      if(!ytPlayer || !ytPlayer.getCurrentTime) return;
      _this.$slider.slider("option", {
        value: ytPlayer.getCurrentTime()
      });
    }, 500);
  },

  play: function(historyData) {
    optionsView.toggleCheckedContinent();
    this.disableNextButton();
    var country = countries.selected();
    this.$countryTitle.text(country.get('fields')['name']);
    this.$artistTitle.html("&mdash;");

    var _this = this;
    if (historyData) {
      var video = historyData.video;
      _this.$artistTitle.text(historyData.artist);
      _this.enableNextButton();
      _this.$slider.slider("option", {
        value: 0,
        max: video.get('duration')
      });
      _this.$youtubeLink.attr("href", "http://www.youtube.com/watch?v=" + video.videoId());

      ytPlayer.clearVideo();
      ytPlayer.loadVideoById(video.videoId(), 0, "hd720");
      return;
    }
    country.fetchVideos(function(artist, videos) {
      var video = videos.shuffle()[0];
      if(!video) return _this.handleNoVideos();
      _this.$artistTitle.text(artist);
      _this.enableNextButton();
      _this.$slider.slider("option", {
        value: 0,
        max: video.get('duration')
      });
      _this.$youtubeLink.attr("href", "http://www.youtube.com/watch?v=" + video.videoId());

      ytPlayer.clearVideo();
      ytPlayer.loadVideoById(video.videoId(), 0, "hd720");
      globalState.pushHistory({video: video, artist: artist, country: countries.selected(), continent: globalState.get('continent')});
    });
  },

  handleNoVideos: function() {
    this.enableNextButton();
    this.next();
  },

  togglePlay: function() {
    if(ytPlayer.getPlayerState() === YT.PlayerState.PLAYING) {
      ytPlayer.pauseVideo();
    }
    else {
      ytPlayer.playVideo();
      this.$togglePlayButton.removeClass("glyphicon-play-circle").addClass("glyphicon-pause");
    }
  },

  next: function() {
    if (globalState.get('nextDisabled')) return;
    countries.selectNextModel();
  },

  previous: function() {
    countries.selectPreviousModel();
  },

  disableNextButton: function() {
    globalState.set('nextDisabled', true);
    this.$nextButton.prop('disabled', true);
  },

  enableNextButton: function() {
    globalState.set('nextDisabled', false);
    this.$nextButton.prop('disabled', false);
  },

  onPlayStateChange: function(state) {
    switch(state) {
      case YT.PlayerState.ENDED:
        this.next();
        break;
      case YT.PlayerState.PLAYING:
        this.$togglePlayButton.removeClass("glyphicon-play-circle").addClass("glyphicon-pause");
        break;
      case YT.PlayerState.PAUSED:
        this.$togglePlayButton.removeClass("glyphicon-pause").addClass("glyphicon-play-circle");
        break;
    }
  }
});

var OptionsView = Backbone.View.extend({
  el: '.options.dropdown',

  events: {
    "click [rel='keyboard-shortcuts']": "openShortcutsModal",
    "click [rel='about']": "openAboutModal",
    "click [rel='continent']": "changeContinent"
  },

  openShortcutsModal: function(e) {
    e.preventDefault();
    $('#modal-shortcuts').modal('show');
  },

  openAboutModal: function(e) {
    e.preventDefault();
    $("#modal-about").modal('show');
  },

  toggleCheckedContinent: function() {
    this.$el.find("[data-continent] .glyphicon").addClass("invisible");
    this.$el.find("[data-continent='"+ globalState.get('continent') +"'] .glyphicon").removeClass("invisible");
  },

  changeContinent: function(e) {
    e.preventDefault();
    globalState.set('continent', $(e.currentTarget).data('continent'), {previous: false});
  }
});

window.onYouTubeIframeAPIReady = function() {
  window.ytPlayer = null;
  window.playerView = new PlayerView();
  window.optionsView = new OptionsView();

  var onWindowResize = function() {
    $("#yt-player").height($(window).height() + 400);
    $("#yt-player").width($(window).width() + 600);
  };

  var onPlayerReady = function() {
    playerView.play();
    new KeyboardShortcutsView();
    onWindowResize();
    $(window).on('resize', onWindowResize);

    ytPlayer.setVolume(50);
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
