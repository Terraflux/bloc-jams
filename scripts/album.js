var createSongRow = function(songNumber, songName, songLength){
    var template =
        '<tr class="album-view-song-item">'
       +'   <td class="song-item-number" data-song-number="' + songNumber + '">' + songNumber + '</td>'
       +'   <td class="song-item-title">' + songName + '</td>'
       +'   <td class="song-item-duration">' + songLength + '</td>'
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
        } else if (currentlyPlayingSongNumber === songNumber){
            $(this).html(playButtonTemplate);
            $('.main-controls .play-pause').html(playerBarPlayButton);
            currentlyPlayingSongNumber = null;
            currentSongFromAlbum = null;
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
}

var trackIndex = function(album, song){
    return album.songs.indexOf(song);
};

var setSong = function(songNumber){
    currentlyPlayingSongNumber = songNumber;
    currentSongFromAlbum = currentAlbum.songs[songNumber - 1];
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
    updatePlayerBarSong();

    var $newSongNumberCell = getSongNumberCell(currentlyPlayingSongNumber)
    var $oldSongNumberCell = getSongNumberCell(oldSongNumber)

    $newSongNumberCell.html(pauseButtonTemplate)
    $oldSongNumberCell.html(oldSongNumber)
};

var playButtonTemplate = '<a class="album-song-button"><span class="ion-play"></span></a>';
var pauseButtonTemplate = '<a class="album-song-button"><span class="ion-pause"></span></a>';
var playerBarPlayButton = '<span class="ion-play"></span>';
var playerBarPauseButton = '<span class="ion-pause"></span>';

var currentAlbum = null;
var currentlyPlayingSongNumber = null;
var currentSongFromAlbum = null;

var $previousButton = $('.main-controls .previous');
var $nextButton = $('.main-controls .next');

$(document).ready(function(){
    setCurrentAlbum(albumPicasso);
    $previousButton.click(function() {
        seekSong(false)
    });
    $nextButton.click(function(){
        seekSong(true)
    });
});