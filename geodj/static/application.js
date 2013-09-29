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
        if(!json) playerView.handleNoVideos();
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
    SPACEBAR: 32,
    RIGHT_ARROW: 39
  },

  onKeyDown: function(e) {
    switch(e.keyCode) {
      case this.Keys.RIGHT_ARROW: playerView.next(); break;
      case this.Keys.SPACEBAR: playerView.togglePlay(); break;
    }
  }
});

var PlayerView = Backbone.View.extend({
  el: '.player',

  events: {
    'click .toggle-play': 'togglePlay',
    'click .next-song': 'next',
  },

  initialize: function() {
    this.$togglePlayButton = this.$el.find(".toggle-play");
    this.$nextButton = this.$el.find(".next-button");
    this.$countryTitle = this.$el.find(".country-title");
    this.$artistTitle = this.$el.find(".artist-title");
    this.$slider = this.$el.find(".seek-slider");
    var _this = this;
    countries.on("change:selected", function() {
      _this.play();
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

    setInterval(function() {
      if(!ytPlayer || !ytPlayer.getCurrentTime) return;
      _this.$slider.slider("option", {
        value: ytPlayer.getCurrentTime()
      });
    }, 500);
  },

  play: function() {
    this.disableNextButton();
    var country = countries.selected();
    this.$countryTitle.text(country.get('fields')['name']);
    this.$artistTitle.html("&mdash;");

    var _this = this;
    country.fetchVideos(function(artist, videos) {
      var video = videos.shuffle()[0];
      if(!video) _this.handleNoVideos();
      _this.$artistTitle.text(artist);
      _this.enableNextButton();
      _this.$slider.slider("option", {
        value: 0,
        max: video.get('duration')
      });

      ytPlayer.clearVideo();
      ytPlayer.loadVideoById(video.videoId(), 0, "hd720");
    });
  },

  handleNoVideos: function() {
    window.location.reload();
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
    "click [rel='keyboard-shortcuts']": "openShortcutsModal"
  },

  openShortcutsModal: function(e) {
    e.preventDefault();
    $('#modal-shortcuts').modal('show');
  }
});

window.onYouTubeIframeAPIReady = function() {
  window.ytPlayer = null;
  window.playerView = new PlayerView();

  var onWindowResize = function() {
    $("#yt-player").height($(window).height() + 400);
    $("#yt-player").width($(window).width() + 600);
  };

  var onPlayerReady = function() {
    playerView.play();
    new KeyboardShortcutsView();
    new OptionsView();
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
