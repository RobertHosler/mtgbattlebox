var fs = require('fs');
var battleboxLands = fs.readFileSync("files/battlebox_lands/lands_allied", 'utf8').split("\n");

var getAllBattleboxes = function() {
  var battleboxes = [];
  fs.readdirSync("files/battleboxes").forEach(file => {
    var battlebox = {};
    battlebox.name = file;
    battlebox.cards = fs.readFileSync("files/battleboxes/" + file, 'utf8').split("\n");
    battleboxes.push(battlebox);
    // console.log("Battlebox: " + battlebox.name, "First Card: " + battlebox.cards[0]);
  });
  return battleboxes;
}

var getAllCubes = function() {
  var cubes = [];
  fs.readdirSync("files/cubes").forEach(file => {
    var cube = {};
    cube.name = file;
    cube.cards = fs.readFileSync("files/cubes/" + file, 'utf8').split("\n");
    cubes.push(cube);
    // console.log("Cube: " + cube.name, "First Card: " + cube.cards[0]);
  });
  return cubes;
}

var getAllCards = function() {
  var allCardsPath = "files/AllCards";
  var allCardsExists = fs.existsSync(allCardsPath); //check if path exists
  var allCards = {};
  if (allCardsExists) {
    //Get all cards stored on local server
    var allCardsRaw = fs.readFileSync(allCardsPath);
    var allCardsJson = JSON.parse(allCardsRaw);
    allCards = allCardsJson;
    // console.log("All Cards read from file");
  }
  else {
    //Create initial file
    var allCardsJson = JSON.stringify(allCards);
    fs.writeFileSync(allCardsPath, allCardsJson);
  }
  return allCards;
}

var MtgFile = {
  battleboxLands: battleboxLands,
  battleboxes: getAllBattleboxes(),
  cubes: getAllCubes(),
  allCards: getAllCards()
}

module.exports = MtgFile;
