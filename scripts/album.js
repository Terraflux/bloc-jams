var createSongRow = function(songNumber, songName, songLength){
    var template =
        '<tr class="album-view-song-item">'
       +'   <td class="song-item-number" data-song-number="' + songNumber + '">' + songNumber + '</td>'
       +'   <td class="song-item-title">' + songName + '</td>'
       +'   <td class="song-item-duration">' + filterTimeCode(songLength) + '</td>'
       +'</tr>'
       ;

    var $row = $(template);

    var clickHandler = function(){
        var songNumber = parseInt($(this).attr('data-song-number'));
        if (currentlyPlayingSongNumber === null){
            var currentlyPlayingCell = $('.song-item-number[data-song-number="' + currentlyPlayingSongNumber + '"]');
            currentlyPlayingCell.html(currentlyPlayingSongNumber);
        }
        if (currentlyPlayingSongNumber !== songNumber){
            $(this).html(pauseButtonTemplate);
            setSong(songNumber)
            updatePlayerBarSong();
            currentSoundFile.play();
            updateSeekBarWhileSongPlays();
            currentSongFromAlbum = currentAlbum.songs[songNumber - 1];

            var $volumeFill = $('.volume .fill');
            var $volumeThumb = $('.volume .thumb');
            $volumeFill.width(currentVolume + '%');
            $volumeThumb.css({left: currentVolume + '%'});

        } else if (currentlyPlayingSongNumber === songNumber){
            if (currentSoundFile.isPaused()){
                $(this).html(pauseButtonTemplate);
                $('.main-controls .play-pause').html(playerBarPauseButton);
                currentSoundFile.play();
                updateSeekBarWhileSongPlays();
            } else {
                $(this).html(playButtonTemplate);
                $('.main-controls .play-pause').html(playerBarPlayButton);
                currentSoundFile.pause();
            }
        }

    };

    var onHover = function(event){
        var songNumberCell = $(this).find('.song-item-number');
        var songNumber = parseInt(songNumberCell.attr('data-song-number'));
        if (songNumber !== currentlyPlayingSongNumber){
            songNumberCell.html(playButtonTemplate);
        }

    };

    var offHover = function(event){
        var songNumberCell = $(this).find('.song-item-number');
        var songNumber = parseInt(songNumberCell.attr('data-song-number'));
        if (songNumber !== currentlyPlayingSongNumber){
            songNumberCell.html(songNumber)
        }
    };

    $row.find('.song-item-number').click(clickHandler);
    $row.hover(onHover, offHover);
    return $row;
};

var setNextAlbum = function(currentAlbum){
    var currentAlbumNumber = albums.indexOf(currentAlbum);
    var nextAlbum = albums[(currentAlbumNumber + 1) % albums.length];
    setCurrentAlbum(nextAlbum);
}

var setCurrentAlbum = function(album){
    var $albumTitle = $('.album-view-title');
    var $albumArtist = $('album-view-artist');
    var $albumReleaseInfo = $('album-view-release-info');
    var $albumImage = $('.album-cover-art');
    var $albumSongList = $('.album-view-song-list');

    $albumTitle.text(album.name);
    $albumArtist.text(album.artist);
    $albumReleaseInfo.text(album.year + ' ' + album.label);
    $albumImage.attr('src', album.albumArtUrl);


    $albumSongList.empty();

    for (i = 0; i < album.songs.length; i++){
        var $newRow = createSongRow(i + 1, album.songs[i].name, album.songs[i].length);
        $albumSongList.append($newRow);
    }

    currentAlbum = album;
};

var updatePlayerBarSong = function(){
    $('.currently-playing .song-name').text(currentSongFromAlbum.name);
    $('.currently-playing .artist-name').text(currentAlbum.artist);
    $('.currently-playing .artist-song-mobile').text(currentSongFromAlbum.name + " - " + currentAlbum.artist);
    $('.main-controls .play-pause').html(playerBarPauseButton)

    var setTotalTimeInPlayerBar = function(totalTime){
        var $totalTimeCell = $('.total-time');
        $totalTimeCell = filterTimeCode(currentSoundFile.getDuration());
    };

};

var trackIndex = function(album, song){
    return album.songs.indexOf(song);
};

var setSong = function(songNumber){
    if (currentSoundFile) {
        currentSoundFile.stop();
    }
    currentlyPlayingSongNumber = songNumber;
    currentSongFromAlbum = currentAlbum.songs[songNumber - 1];
    currentSoundFile = new buzz.sound(currentSongFromAlbum.audioUrl, {
        formats: ['mp3'],
        preload: true
    });
    setVolume(currentVolume);
};

var getSongNumberCell = function(number){
    return $('.song-item-number[data-song-number="' + number + '"]');
};

var seekSong = function(bool){
    var currentSongIndex = trackIndex(currentAlbum, currentSongFromAlbum);
    var oldSongNumber = currentSongIndex + 1;
    if (bool) {
        currentSongIndex++
        if (currentSongIndex >= currentAlbum.songs.length){
            currentSongIndex = 0;
        }
        
    } else {
        currentSongIndex--
        if (currentSongIndex < 0){
            currentSongIndex = currentAlbum.songs.length - 1;
        }
        setSong(currentSongIndex + 1);
        updatePlayerBarSong();
    }

    setSong(currentSongIndex + 1);
    currentSoundFile.play();
    updatePlayerBarSong();
    updateSeekBarWhileSongPlays();

    var $newSongNumberCell = getSongNumberCell(currentlyPlayingSongNumber)
    var $oldSongNumberCell = getSongNumberCell(oldSongNumber)

    $newSongNumberCell.html(pauseButtonTemplate)
    $oldSongNumberCell.html(oldSongNumber)
};

var seek = function(time){
    if (currentSoundFile){
        currentSoundFile.setTime(time);
    }
};

var setVolume = function(volume) {
    if (currentSoundFile){
        currentSoundFile.setVolume(volume);
    }
};

var filterTimeCode = function(timeInSeconds){
    buzz.toTimer(timeInSeconds);
};

var togglePlayFromPlayerBar = function(){
    var $currentlyPlayingCell = getSongNumberCell(currentlyPlayingSongNumber)
    if (currentSoundFile.isPaused()){
        $currentlyPlayingCell.html(pauseButtonTemplate);
        $(this).html(playerBarPauseButton);
        currentSoundFile.play();
    } else if (currentSoundFile){
        $currentlyPlayingCell.html(playButtonTemplate);
        $(this).html(playerBarPlayButton);
        currentSoundFile.pause();
    }
};

var updateSeekBarWhileSongPlays = function(){
    if (currentSoundFile){
        currentSoundFile.bind('timeupdate', function(){
            var seekBarFillRatio = this.getTime() / this.getDuration();
            var $seekBar = $('.seek-control .seek-bar');
            updateSeekPercentage($seekBar, seekBarFillRatio);
        });
    }

    var setCurrentTimeInPlayerBar = function(currentTime){
        var $currentTimeCell = $('.current-time');
        $currentTimeCell = filterTimeCode(currentSoundFile.getTime());
    };

};

var updateSeekPercentage = function($seekBar, seekBarFillRatio){
    var offsetXPercent = seekBarFillRatio * 100;

    offsetXPercent = Math.max(0, offsetXPercent);
    offsetXPercent = Math.min(100, offsetXPercent);

    var percentageString = offsetXPercent + '%';
    $seekBar.find('.fill').width(percentageString);
    $seekBar.find('.thumb').css({left: percentageString});
};

var setupSeekBars = function(){
    var $seekBars = $('.player-bar .seek-bar');

    $seekBars.click(function(){
        var offsetX = event.pageX - $(this).offset().left;
        var barWidth = $(this).width();
        var seekBarFillRatio = offsetX / barWidth;

        if ($(this).parent().attr('class') == 'seek-control'){
            seek(seekBarFillRatio * currentSoundFile.getDuration());
        } else {
            setVolume(seekBarFillRatio * 100);
        }

        updateSeekPercentage($(this), seekBarFillRatio);
    });

    $seekBars.find('.thumb').mousedown(function(event) {
        var $seekBar = $(this).parent();

        $(document).bind('mousemove.thumb', function(event){
            var offsetX = event.pageX - $seekBar.offset().left;
            var barWidth = $seekBar.width();
            var seekBarFillRatio = offsetX / barWidth;

            if ($(this).parent().attr('class') == 'seek-control'){
                seek(seekBarFillRatio * currentSoundFile.getDuration());
            } else {
                setVolume(seekBarFillRatio * 100);
            }

            updateSeekPercentage($seekBar, seekBarFillRatio);
        });

        $(document).bind('mouseup.thumb', function(){
            $(document).unbind('mousemove.thumb');
            $(document).unbind('mouseup.thumb');
        });

    });
}




var playButtonTemplate = '<a class="album-song-button"><span class="ion-play"></span></a>';
var pauseButtonTemplate = '<a class="album-song-button"><span class="ion-pause"></span></a>';
var playerBarPlayButton = '<span class="ion-play"></span>';
var playerBarPauseButton = '<span class="ion-pause"></span>';

var currentAlbum = null;
var currentlyPlayingSongNumber = null;
var currentSongFromAlbum = null;
var currentSoundFile = null;
var currentVolume = 80;

var $previousButton = $('.main-controls .previous');
var $nextButton = $('.main-controls .next');
var $playPauseButton = $('.main-controls .play-pause');

$(document).ready(function(){
    setCurrentAlbum(albumPicasso);
    setupSeekBars();
    $previousButton.click(function() {
        seekSong(false)
    });
    $nextButton.click(function(){
        seekSong(true)
    });
    $playPauseButton.click(togglePlayFromPlayerBar);
});