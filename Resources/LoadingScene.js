/*
 * Loading Scene
 */
var alloy = require('co.lanica.platino');

function LoadingScene(window, game) {
    var self = alloy.createScene();
    
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
        "assets/egg_1.png",
        "assets/egg_2.png",
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
        "assets/npc2_a.png",
        "assets/npc2_b.png",
        "assets/npc2_c.png",
        "assets/npc2_d.png",
        "assets/npc3_a.png",
        "assets/npc3_b.png",
        "assets/npc3_c.png",
        "assets/npc3_d.png",
        "assets/npc4_a.png",
        "assets/npc4_b.png",
        "assets/npc5_a.png",
        "assets/npc5_b.png",
        "assets/npc6_a.png",
        "assets/npc6_b.png",
        "assets/npc6_c.png",
        "assets/npc6_d.png",
        "assets/npc7_a.png",
        "assets/npc7_b.png",
        "assets/npc7_c.png",
        "assets/npc7_d.png",
        "assets/npc8_a.png",
        "assets/npc8_b.png",
        "assets/npc8_c.png",
        "assets/npc8_d.png",
        "assets/windgauge.png"
    ];

    var startloadingAssets = function(e) {
        if (loadingCount < loadingTextures.length) {
            game.loadTexture(loadingTextures[loadingCount]);
            
            loadingCount = loadingCount + 1;
            loadingScreen.y = -game.screen.height * (loadingTextures.length - loadingCount) / loadingTextures.length;
            setTimeout(startloadingAssets, 100);
        } else {
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
                image:'assets/loading_screen.png',
                tag:'LOADING_SCREEN'});
        }
        
        var bgfactor = 2 * game.screen.height / loadingScreen.height;
        loadingScreen.width  = loadingScreen.width * bgfactor;
        loadingScreen.height = game.screen.height * 2;
        loadingScreen.center = {x:game.screen.width * 0.5, y:game.screen.height * 0.5};
        loadingScreen.y = -game.screen.height;
                
        self.add(loadingScreen);
    });
    
    self.addEventListener('deactivated', function(e) {
        Ti.API.info("loading scene is deactivated");
        
        if (loadingScreen !== null) {
            self.remove(loadingScreen);
            loadingScreen = null;
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
