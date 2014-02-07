/*
 * Loading Scene
 */
var alloy = require('co.lanica.platino');

function LoadingScene(window, game) {
    var self = alloy.createScene();
    
    var progressBar   = null;
    var loadingScreen = null;
    var loadingBanner = null;
    var loadingBadge  = null;
    
    var loadingCount = 0;
    var loadingTextures = [
        "assets/background_d.png",
        "assets/bus1.png",
        "assets/bus2.png",
        "assets/cycle10.png",
        "assets/cycle1.png",
        "assets/cycle2.png",
        "assets/cycle3.png",
        "assets/cycle4.png",
        "assets/cycle5.png",
        "assets/cycle6.png",
        "assets/cycle7.png",
        "assets/cycle8.png",
        "assets/cycle9.png",
        "assets/eggtray-egg.png",
        "assets/eggtray-mockup.png",
        "assets/eggtray.png",
        "assets/eggtray-rotten.png",
        "assets/grandma_1.png",
        "assets/grandma_2.png",
        "assets/npc1_a.png",
        "assets/npc1_b.png",
        "assets/npc1_c.png",
        "assets/npc1_d.png",
        "assets/pedestrian_1.png",
        "assets/windgauge.png",
        "graphics/titlescreen.png"
    ];

    var startloadingAssets = function(e) {
        if (progressBar === null) return;
        if (loadingCount === 0) {
            window.add(progressBar);
            progressBar.show();
        }
        if (loadingCount < loadingTextures.length) {
            game.loadTexture(loadingTextures[loadingCount]);
            
            loadingCount = loadingCount + 1;
            progressBar.value = loadingCount;

            setTimeout(startloadingAssets, 100);
        } else {
            progressBar.hide();
            
            var MainScene     = require("MainScene");
            game.currentScene = new MainScene(window, game);
            game.replaceScene(game.currentScene);
        }
    };
    
    self.addEventListener('activated', function(e) {
        Ti.API.info("loading scene is activated");
        
        loadingCount = 0;
        
        if (loadingScreen === null) {
            loadingScreen = alloy.createSprite({
                image:'graphics/mainloading.png',
                tag:'LOADING_SCREEN'});
        }
        
        var bgfactor = game.screen.height / loadingScreen.height;
        loadingScreen.width  = loadingScreen.width * bgfactor;
        loadingScreen.height = game.screen.height;
                
        if (loadingScreen.width < game.screen.width) {
            loadingScreen.center = {x:game.screen.width * 0.5, y:game.screen.height * 0.5};
        } else {
            loadingScreen.x = game.STAGE_START.x;
            loadingScreen.y = game.STAGE_START.y;
        }
        self.add(loadingScreen);

        if (progressBar === null) {
            progressBar = Titanium.UI.createProgressBar({
                width :  loadingScreen.width * 0.3 / game.touchScaleX,
                height : loadingScreen.height * 0.2 / game.touchScaleY,
                min : 0,
                max : loadingTextures.length,
                value : 0,
                color : '#888',
                message : '',
                style : Titanium.UI.iPhone.ProgressBarStyle.PLAIN
            });
            progressBar.center = {
                x : (game.screen.width * 0.5 / game.touchScaleX),
                y : (loadingScreen.height * 0.845 / game.touchScaleY)
            };
        }
    });
    
    self.addEventListener('deactivated', function(e) {
        Ti.API.info("loading scene is deactivated");
        
        if (loadingScreen !== null) {
            self.remove(loadingScreen);
            loadingScreen = null;
        }
        
        if (progressBar !== null) {
            window.remove(progressBar);
            progressBar = null;
        }
        
        game.unloadTextureByTag('LOADING_SCREEN');
    });
    
    self.addEventListener('onloadsprite', function(e) {
        Ti.API.info("onloadsprite: " + e.tag);
        if (e.tag == "LOADING_SCREEN") {
            setTimeout(startloadingAssets, 500);
        }
    });

    return self;
}

module.exports = LoadingScene;
