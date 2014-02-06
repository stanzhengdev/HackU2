/*
 * Shooter game example
 *
 * Touch screen to move our ship. The bullets are fired automatically.
 */
var alloy = require('co.lanica.platino');

function MainScene(window, game) {

    var debug = true;

    // Create scene
    var self = alloy.createScene();

    var track = null;
    var titleScreen = null;

    var titleScreenTransform = null;
    var trackTransform = null;

    var lookAtTransform  = null;
    var zoomOutTransform = null;

    var bikes = [];

    var OUTER_LANE_SPEED = 5;
    var INNER_LANE_SPEED = 10;

    var started = false;

    var bikeSprites = [
        'assets/cycle1.png',
        'assets/cycle2.png',
        'assets/cycle3.png',
        'assets/cycle4.png',
        'assets/cycle5.png',
        'assets/cycle6.png',
        'assets/cycle7.png'
    ];

    var updateTimer = function(e) {
        for (var i in bikes) {
            bikes[i].x += bikes[i].velX;
            bikes[i].y += bikes[i].velY;

            if (bikes[i].x > track.width + bikes[i].width && bikes[i].velX > 0) {
                //TODO remove object
            }

            if (bikes[i].x < -100 && bikes[i].velX < 0) {
                //TODO remove object
            }
        }
    };

    var spawnOuterLaneBikes = function (e) {
        var newBike;
        var spriteImage = bikeSprites[Math.floor((Math.random()*bikeSprites.length))];

        if (Math.random() > 0.5) {
            newBike = alloy.createSprite({image:spriteImage});
            newBike.velX = OUTER_LANE_SPEED;
            newBike.velY = 0;
            newBike.x = -newBike.width;
            newBike.y = 530;
        } else {
            newBike = alloy.createSprite({image:spriteImage});
            newBike.velX = -OUTER_LANE_SPEED;
            newBike.velY = 0;
            newBike.x = track.width + newBike.width;
            newBike.y = 100;
            newBike.scaleX = -1;
        }

        newBike.rotationCenter = {x:newBike.width * 0.5, y:newBike.height * 0.5};
        newBike.z = track.z + 1;
        self.add(newBike);
        bikes.push(newBike);
    }

    var spawnInnerLaneBikes = function (e) {
        var newBike;
        var spriteImage = bikeSprites[Math.floor((Math.random()*bikeSprites.length))];

        if (Math.random() > 0.5) {
            newBike = alloy.createSprite({image:spriteImage});
            newBike.velX = INNER_LANE_SPEED;
            newBike.x = -newBike.width;
            newBike.y = 400;
        } else {
            newBike = alloy.createSprite({image:spriteImage});
            newBike.velX = -INNER_LANE_SPEED;
            newBike.x = track.width + newBike.width;
            newBike.y = 230;
            newBike.scaleX = -1;
        }

        newBike.velY = 0;
        newBike.rotationCenter = {x:newBike.width * 0.5, y:newBike.height * 0.5};
        newBike.z = track.z + 1;
        self.add(newBike);
        bikes.push(newBike);
    }

    var zoomOutCompleted = function(e) {
        setInterval(updateTimer, 33);
        setInterval(spawnOuterLaneBikes, Math.floor((Math.random()*1000)+1500));
        setInterval(spawnInnerLaneBikes, Math.floor((Math.random()*1000)+1500));
    };

    var titleScreenTransformCompleted = function(e) {
        started = true;

        track.show();

        track.duration = 1500;
        track.transform(trackTransform);
    };

    var handleTouch = function(_e) {
        var e =  {type:_e.type, source:_e.source};
        e.x = _e.x * game.touchScaleX;
        e.y = _e.y * game.touchScaleY;

        if (e.type == "touchstart") {
            if (!started) {
                if (titleScreen.alpha == 1) {
                    titleScreenTransform.duration = 1000;
                    titleScreenTransform.alpha = 0;
                    titleScreen.transform(titleScreenTransform);
                }
            }
        }
    };

    self.addEventListener('onloadsprite', function(e) {
        Ti.API.info("onloadsprite: " + e.tag);
        if (e.tag == "TRACK") {
            game.unloadTexture(e.tag);
        } else if (e.tag == "TITLE_SCREEN") {
            game.unloadTexture(e.tag);

            var t = alloy.createTransform();
            t.duration = 1500;
            t.alpha = 1;

            titleScreen.transform(t);
        }
    });

    function zoomOut() {
        var defaultCamera = game.defaultCamera;

        zoomOutTransform.duration = 1;
        zoomOutTransform.easing = alloy.ANIMATION_CURVE_EASE_IN;
        zoomOutTransform.lookAt_centerX = track.width  * 0.5;
        zoomOutTransform.lookAt_centerY = track.height * 0.5;
        zoomOutTransform.lookAt_eyeX = track.width  * 0.5;
        zoomOutTransform.lookAt_eyeY = track.height * 0.5;
        zoomOutTransform.lookAt_eyeZ = defaultCamera.eyeZ;

        game.moveCamera(zoomOutTransform);
    }

    self.addEventListener('activated', function(e) {
        Ti.API.info("main scene is activated");

        bikes = [];
        started = false;

        if (track === null) {
            track = alloy.createSprite({image:'assets/background.png'});
            track.tag = "TRACK";
        }

        if (titleScreen === null) {
            titleScreen = alloy.createSprite({image:'graphics/titlescreen.png'});
            titleScreen.tag = "TITLE_SCREEN";
        }

        if (lookAtTransform === null) {
            lookAtTransform = alloy.createTransform();
        }

        if (zoomOutTransform === null) {
            zoomOutTransform = alloy.createTransform();
        }

        if (titleScreenTransform === null) {
            titleScreenTransform = alloy.createTransform();
        }

        if (trackTransform === null) {
            trackTransform = alloy.createTransform();
        }

        zoomOutTransform.addEventListener('complete', zoomOutCompleted);
        titleScreenTransform.addEventListener('complete', titleScreenTransformCompleted);
        trackTransform.addEventListener('complete', zoomOut);

        track.hide();

        self.add(titleScreen);
        self.add(track);

        game.addEventListener('touchstart', handleTouch);
        game.addEventListener('touchmove',  handleTouch);
        game.addEventListener('touchend',   handleTouch);

        game.startCurrentScene();
    });

    self.addEventListener('deactivated', function(e) {
        Ti.API.info("main scene is deactivated");

        if (track !== null) {
            self.remove(track);
            track = null;
        }

        game.removeEventListener('touchstart', handleTouch);
        game.removeEventListener('touchmove',  handleTouch);
        game.removeEventListener('touchend',   handleTouch);
    });

    return self;
}

module.exports = MainScene;
