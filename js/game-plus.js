var gvHandler = {
  saveStage : function(gameCanvas) {
    var jsonData = {
      'ro': [],
      'bg': ''
    };
    for (i in gameCanvas.characters) {
      jsonData.ro.push({
        'name' : gameCanvas.characters[i].stateData.skeletonData.code,
        'skin' : gameCanvas.characters[i].stateData.skeletonData.skin,
        'x' : gameCanvas.characters[i].x,
        'y' : gameCanvas.characters[i].y,
        'scale' : gameCanvas.characters[i].scale.x,
        'animation' : gameCanvas.characters[i].animation
      });
    }
    jsonData.bg = gameCanvas.background.filename;
    var jsonString = JSON.stringify(jsonData);
    var shareUrl = location.protocol+'//'+location.host+location.pathname + '#' + encodeURIComponent(jsonString);
    alert(shareUrl);
  },

  savePng : function(gameCanvas) {
    if (confirm("產生圖片在下方後請右鍵存檔")) {
      var renderTexture = new PIXI.RenderTexture(gameCanvas.renderer, 1920, 1080);
      renderTexture.render(gameCanvas.stage);
      var canvas = renderTexture.getCanvas();
      $('#saveImage').attr('src', canvas.toDataURL('image/png')).show();
    }
  }
};

game.setGameCanvasHandler(gvHandler);