var _ = require('libs/underscore-min')._;
/*
 * Shooter game example
 *
 * Touch screen to move our ship. The bullets are fired automatically.
 */
var alloy = require('co.lanica.platino');

function MainScene(window, game) {
    var _ = require('libs/underscore-min')._;

    var debug = true;
    var button;
    // Create scene
    var self = alloy.createScene();

    var track = null;
    var titleScreen = null;

    var lookAtTransform  = null;
    var zoomOutTransform = null;
    var thrownEggTransform = null;
    var thrownEggScaleTransform = null;

    var bikes = [];
    var pedestrians = [];

    var grandma;
    var grandmaThrow;

    var eggTray;
    var timer;
    var eggs = [];
    var NUM_EGGS = 12;
    var eggsLeft = NUM_EGGS;
    var rottenEgg;
    var thrownEgg = null;

    var OUTER_LANE_SPEED = 5;
    var INNER_LANE_SPEED = 8;
    var PEDESTRIAN_SPEED = 2;

    var score = 0;
    var scoreSprite;
    var deadCount = 0;
    var deadCountSprite = 0;
    var jostleBike = null;
    var jostleOrigY;
    var jostleDuration = 0;

    var webview;
    var webview_window;

    var bikeSprites = [
        'assets/cycle1.png',
        'assets/cycle2.png',
        'assets/cycle3.png',
        'assets/cycle4.png',
        'assets/cycle5.png',
        'assets/cycle6.png',
        'assets/cycle7.png',
        'assets/cycle8.png',
        'assets/cycle9.png',
        'assets/cycle10.png',
        'assets/bus1.png',
        'assets/bus2.png'
    ];

    var pedestrianSprites = [
        ['assets/npc1_a.png', 'assets/npc1_b.png', 'assets/npc1_c.png', 'assets/npc1_d.png'],
        ['assets/npc2_a.png', 'assets/npc2_b.png', 'assets/npc2_c.png', 'assets/npc2_d.png'],
        ['assets/npc3_a.png', 'assets/npc3_b.png', 'assets/npc3_c.png', 'assets/npc3_d.png'],
        ['assets/npc4_a.png', 'assets/npc4_b.png'],
        ['assets/npc5_a.png', 'assets/npc5_b.png'],
        ['assets/npc6_a.png', 'assets/npc6_b.png', 'assets/npc6_c.png', 'assets/npc6_d.png'],
        ['assets/npc7_a.png', 'assets/npc7_b.png', 'assets/npc7_c.png', 'assets/npc7_d.png'],
        ['assets/npc8_a.png', 'assets/npc8_b.png', 'assets/npc8_c.png', 'assets/npc8_d.png']
    ];

    var isThrowing = false;
    var isReloading = false;

    var bikesToRemove = [];
    var pedestriansToRemove = [];

    var animationDelay = 0;

    var pickBikeToJostle = function() {
        if (bikes.length > 0) {
            jostleBike = bikes[Math.floor(bikes.length * Math.random())];
            jostleOrigY = jostleBike.y;
            jostleDuration = 10;
        } else {
            jostleBike = null;
        }
    };

    var updateTimer = function(e) {
        for (var i in bikes) {
            bikes[i].x += bikes[i].velX;

            if ((bikes[i].x > track.width && bikes[i].velX > 0) || (bikes[i].x < -bikes[i].width && bikes[i].velX < 0)) {
                self.remove(bikes[i]);
                bikesToRemove.push(bikes[i]);
            }
        }

        for (var i in pedestrians) {
            pedestrians[i].y += pedestrians[i].velY;

            if ((pedestrians[i].y > track.height && pedestrians[i].velY > 0) || (pedestrians[i].y < -pedestrians[i].height && pedestrians[i].velY < 0)) {
                score += 10;
                self.remove(pedestrians[i]);
                pedestriansToRemove.push(pedestrians[i]);
            }
        }

        scoreSprite.text = score;
        deadCountSprite.text = "Crashes: \n" + deadCount;

        handleCollisions();

        if (jostleBike != null) {
            jostleBike.y = jostleOrigY + (Math.sin(jostleDuration) * 3.0);
            jostleDuration--;
            if(jostleDuration <= 0) {
                jostleBike.y = jostleOrigY;
                pickBikeToJostle();
            }
        } else {
            pickBikeToJostle();
        }

        while (bikesToRemove.length > 0) {
            var bikeToRemove = bikesToRemove.pop();
            if (bikeToRemove == jostleBike) {
                jostleBike = null;
            }

            bikeToRemove.dispose();
            bikes = _.without(bikes, bikeToRemove);
        }

        while (pedestriansToRemove.length > 0) {
            var pedestrianToRemove = pedestriansToRemove.pop();
            pedestrianToRemove.dispose();
            pedestrians = _.without(pedestrians, pedestrianToRemove);
        }

        animationDelay++;
        if (animationDelay % 5 == 0) {
            animatePedestrians();

            if (isReloading) {
                blinkEggTray();
            }
        }
    };

    var animatePedestrians = function() {
        for (var i in pedestrians) {
            pedestrians[i].currentFrame++;
            if (pedestrians[i].currentFrame > pedestrianSprites[pedestrians[i].type].length - 1) {
                pedestrians[i].currentFrame = 0;
            }
            pedestrians[i].image = pedestrianSprites[pedestrians[i].type][pedestrians[i].currentFrame];
        }
    };

    var blinkEggTray = function() {
        if (eggTray.alpha == 0) {
            eggTray.show();
        } else {
            eggTray.hide();
        }
    };

    var handleCollisions = function () {
        for (var i in bikes) {
            for (var j in pedestrians) {
                if (pedestrians[j].collidesWith(bikes[i])) {
                    deadCount++;
                    bikesToRemove.push(bikes[i]);
                    pedestriansToRemove.push(pedestrians[j]);
                    self.remove(bikes[i]);
                    self.remove(pedestrians[j]);
                }
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
            newBike.y = 510;
            newBike.rotationCenter = {x:newBike.width * 0.5, y:newBike.height * 0.5};
        } else {
            newBike = alloy.createSprite({image:spriteImage});
            newBike.velX = -OUTER_LANE_SPEED;
            newBike.velY = 0;
            newBike.x = track.width + newBike.width;
            newBike.y = 70;
            newBike.rotationCenter = {x:newBike.width * 0.5, y:newBike.height * 0.5};
            newBike.scaleFromCenter(-1, 1, newBike.width * 0.5, newBike.height * 0.5);
        }

        newBike.z = track.z + 1;
        self.add(newBike);
        bikes.push(newBike);
    };

    var spawnInnerLaneBikes = function (e) {
        var newBike;
        var spriteImage = bikeSprites[Math.floor((Math.random()*bikeSprites.length))];

        if (Math.random() > 0.5) {
            newBike = alloy.createSprite({image:spriteImage});
            newBike.velX = INNER_LANE_SPEED;
            newBike.x = -newBike.width;
            newBike.y = 360;
            newBike.rotationCenter = {x:newBike.width * 0.5, y:newBike.height * 0.5};
        } else {
            newBike = alloy.createSprite({image:spriteImage});
            newBike.velX = -INNER_LANE_SPEED;
            newBike.x = track.width + newBike.width;
            newBike.y = 220;
            newBike.rotationCenter = {x:newBike.width * 0.5, y:newBike.height * 0.5};
            newBike.scaleFromCenter(-1, 1, newBike.width * 0.5, newBike.height * 0.5);
        }

        newBike.velY = 0;
        newBike.z = track.z + 1;
        self.add(newBike);
        bikes.push(newBike);
    };

    var spawnPedestrians = function (e) {
        var newPedestrian;
        var type = Math.floor((Math.random()*pedestrianSprites.length));
        var spriteImage = pedestrianSprites[type][0];

        if (Math.random() > 0.5) {
            newPedestrian = alloy.createSprite({image:spriteImage});
            newPedestrian.velY = PEDESTRIAN_SPEED;
            newPedestrian.y = 0 - newPedestrian.height;
            newPedestrian.rotationCenter = {x:newPedestrian.width * 0.5, y:newPedestrian.height * 0.5};
        } else {
            newPedestrian = alloy.createSprite({image:spriteImage});
            newPedestrian.velY = -PEDESTRIAN_SPEED;
            newPedestrian.y = track.height;
            newPedestrian.rotationCenter = {x:newPedestrian.width * 0.5, y:newPedestrian.height * 0.5};
            newPedestrian.scaleFromCenter(-1, 1, newPedestrian.width * 0.5, newPedestrian.height * 0.5);
        }

        newPedestrian.type = type;
        newPedestrian.currentFrame = 0;
        newPedestrian.x = track.width * 0.5;
        newPedestrian.velX = 0;
        newPedestrian.z = track.z + 1;
        self.add(newPedestrian);
        pedestrians.push(newPedestrian);
    };

    var zoomOutCompleted = function(e) {
        setInterval(updateTimer, 33);
        setInterval(spawnOuterLaneBikes, Math.floor((Math.random()*1000)+3000));
        setInterval(spawnInnerLaneBikes, Math.floor((Math.random()*1000)+3000));

        setInterval(spawnPedestrians, Math.floor((Math.random()*2000)+4000));

        grandma = alloy.createSprite({image:'assets/grandma_1.png'});
        grandma.x = (track.width - grandma.width) / 2;
        grandma.y = track.height - grandma.height;
        grandma.z = track.z + 10;
        grandmaThrow = alloy.createSprite({image:'assets/grandma_2.png'});
        grandmaThrow.x = (track.width - grandmaThrow.width) / 2;
        grandmaThrow.y = track.height - grandmaThrow.height;
        grandmaThrow.z = track.z + 10;
        self.add(grandma);
        
        scoreSprite = alloy.createTextSprite({text:'', fontSize:75});
        scoreSprite.fontFamily = 'Chantelli_Antiqua';
        scoreSprite.x = (track.width / 2 - scoreSprite.width) / 2;
        scoreSprite.y = 20;
        self.add(scoreSprite);

        deadCountSprite = alloy.createTextSprite({text:"Crashes: \n 000", fontSize:24});
        deadCountSprite.fontFamily = 'Chantelli_Antiqua';
        deadCountSprite.x = track.width - deadCountSprite.width - 100;
        deadCountSprite.y = track.height - deadCountSprite.height - 50;
        deadCountSprite.z = grandma.z + 1;
        self.add(deadCountSprite);

        initializeEggs();
    };

    var initializeEggs = function() {
        eggTray = alloy.createSprite({image:'assets/eggtray.png'});
        eggTray.x = 20;
        eggTray.y = track.height - eggTray.height - 20;
        eggTray.z = track.z + 1;
        self.add(eggTray);

        rottenEgg = Math.floor(Math.random() * NUM_EGGS);

        for (var i = 0; i < NUM_EGGS; i++) {
            var spriteImage = 'assets/eggtray-egg.png';
            if (i === rottenEgg) {
                spriteImage = 'assets/eggtray-rotten.png';
            }

            eggs[i] = alloy.createSprite({image:spriteImage});
            eggs[i].x = 36 + (i % 6) * 32;
            eggs[i].y = eggTray.y + 16 + (Math.floor(i / 6) * 32);
            eggs[i].z = track.z + 2;
            self.add(eggs[i]);
        }
    };

    var handleTouch = function(e) {
        if (e.type == "touchstart") {
            if (!isThrowing) {
                throwEgg(e);
            }
        }
    };

    var throwEgg = function(e) {
        var x = e.x * game.touchScaleX;
        var y = e.y * game.touchScaleY;
        if (Ti.Platform.osname == "android") {
            x -= 75;
            y -= 15;
        }

        self.remove(grandma);
        self.add(grandmaThrow);
        eggsLeft--;
        if (eggsLeft >= 0) {
            self.remove(eggs[eggsLeft]);
        }

        isThrowing = true;

        var eggSprite = 'assets/eggtray-egg.png';
        if (eggsLeft === rottenEgg) {
            eggSprite = 'assets/eggtray-rotten.png';
        }

        thrownEgg = alloy.createSprite({image:eggSprite});
        thrownEgg.x = grandma.x + grandma.width - 50;
        thrownEgg.y = grandma.y + 50;
        thrownEgg.z = grandma.z - 1;
        thrownEgg.scaleX = 3;
        thrownEgg.scaleY = 3;
        self.add(thrownEgg);

        thrownEggTransform.duration = 500;
        thrownEggTransform.x = x;
        thrownEggTransform.y = y;
        thrownEggTransform.z = track.z + 0.5;
        thrownEggTransform.easing = alloy.ANIMATION_CURVE_QUAD_IN_OUT;
        thrownEggTransform.scaleX = 0.3;
        thrownEggTransform.scaleY = 0.3;
        thrownEgg.transform(thrownEggTransform);
    };

    var reloadEggs = function() {
        isThrowing = false;
        isReloading = false;
        eggTray.show();
        for (var i = 0; i < NUM_EGGS; i++) {
            self.add(eggs[i]);
        }

        eggsLeft = NUM_EGGS;
    }

    var thrownEggCompleted = function() {
        self.remove(grandmaThrow);
        self.add(grandma);

        thrownEgg.image = 'assets/egg_1.png';
        thrownEgg.scaleX = 1;
        thrownEgg.scaleY = 1;
        if (eggsLeft == rottenEgg) {
            thrownEgg.image = 'assets/egg_2.png';
        }

        if (eggsLeft > 0) {
            isThrowing = false;
        } else {
            isReloading = true;
            setTimeout(reloadEggs, 1000);
        }

        for (var i in bikes) {
            if (bikes[i].contains(thrownEgg.x, thrownEgg.y)) {
                self.remove(bikes[i]);
                bikesToRemove.push(bikes[i]);
                score++;
                if (eggsLeft === rottenEgg) {
                    score += 5;
                }
            }
        }

        for (var i in pedestrians) {
            if (pedestrians[i].contains(thrownEgg.x, thrownEgg.y)) {
                self.remove(pedestrians[i]);
                pedestriansToRemove.push(pedestrians[i]);
                score -= 10;
                deadCount++;
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

    var hideWebView = function() {
       webview_window.close(); 
    };

    self.addEventListener('activated', function(e) {
        Ti.API.info("main scene is activated");

        webview = Titanium.UI.createWebView({url:'http://dev.mateoj.com/hacku/phpservice'});
        webview_window = Titanium.UI.createWindow();
        webview_window.add(webview);
        webview_window.open({modal:true});
        button = Titanium.UI.createButton({
            title: 'Close',
            button: 20,
            width: 150,
            height: 100
        });
        webview_window.add(button);
        setTimeout(hideWebView, 10000);
        button.addEventListener('click', hideWebView);

        bikes = [];
        pedestrians = [];

        if (track === null) {
            track = alloy.createSprite({image:'assets/background_d.png'});
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

        if (thrownEggTransform === null) {
            thrownEggTransform = alloy.createTransform();
        }

        if (thrownEggScaleTransform === null) {
            thrownEggScaleTransform = alloy.createTransform();
        }

        zoomOutTransform.addEventListener('complete', zoomOutCompleted);
        thrownEggTransform.addEventListener('complete', thrownEggCompleted);

        track.hide();

        self.add(track);

        game.addEventListener('touchstart', handleTouch);
        game.addEventListener('touchmove',  handleTouch);
        game.addEventListener('touchend',   handleTouch);

        game.startCurrentScene();
        track.show();

        zoomOut();
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
