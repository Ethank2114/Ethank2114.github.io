var randInt = function(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

var randColor = function() {
	let r = randInt(0, 255);
	let g = randInt(0, 255);
	let b = randInt(0, 255)
	return "rgb(" + r.toString() + ", "+ g.toString() + ", " + b.toString() + ")"; 
}

		// create set with all divisors of num
var divsOf = function(num) {
	let set = new Set();
	for(var i = 1; i < num; i++) {
		if(num % i == 0) {
			set.add(i);
		}
	}
	return set;
}
		
var drawRect = function(x, y, width, height, color) {
	frame.fillStyle = color
	frame.fillRect(x, y, width, height)
}

// VARIABLES //

const canvas = document.getElementById("canvas");
const frame = canvas.getContext("2d");
const backgroundColor = "rgb(33, 33, 33)";

var tileSize = 10;
var numSeeds = 5;
var speed = 10;
var seedColor = "random";
var mixingStrength = 25;

var workerPointer;

var map = [];
var seeds = [];
var defMap = [];

var maps = [];
var currentMap = 0;

var intervalPointer;

var mapReady = true;

// VARIABLES //

var swapMaps = function() {
	currentMap = (currentMap + 1) % 2;
}

		var printCanvas = function() {

			let dateObj = new Date();
			let date = dateObj.getFullYear() + "/" + (dateObj.getMonth() + 1) + "/" + dateObj.getDate();
			let time = dateObj.getHours() + ":" + dateObj.getMinutes() + ":" + dateObj.getSeconds();

  			var img = new Image();
  			saveAs(canvas.toDataURL(), date + "_" + time + ".png"); // from FileSaver.js

		}

		var populateMap = function() {
			map = [];
			for(var x = 0; x < canvas.width / tileSize; x++) {
				let temp = [];
				for(var y = 0; y < canvas.height / tileSize; y++) {
					temp.push({x:x, y:y, color:backgroundColor});
				}
				map[x] = temp;
			}
		}

		var clearUnusedMap = function() {
			maps[(currentMap + 1) % 2] = [];
			for(var x = 0; x < canvas.width; x++) {
				let temp = [];
				for(var y = 0; y < canvas.height; y++) {
					temp.push({x:x, y:y, color:backgroundColor});
				}
				maps[(currentMap + 1) % 2][x] = temp;
			}
		}

		var initMaps = function() {
			maps[currentMap] = [];
			for(var x = 0; x < canvas.width; x++) {
				let temp = [];
				for(var y = 0; y < canvas.height; y++) {
					temp.push({x:x, y:y, color:backgroundColor});
				}
				maps[currentMap][x] = temp;
			}
			maps[(currentMap + 1) % 2] = maps[currentMap].slice(0);
		}

		var clearMap = function() {
			drawRect(0,0,canvas.width, canvas.width, backgroundColor);
		}

		/*var populateDefMap = function() {

		}

		var populateMap = function() {
			console.log(defMap);
			console.log(map);
			if(defMap.length == 0) {
				for(var x = 0; x < canvas.width; x++) {
					let temp = [];
					for(var y = 0; y < canvas.height; y++) {
						temp.push({x:x, y:y, color:backgroundColor});
					}
					defMap[x] = temp;
				}
			} 

			map = defMap.slice(0);
			
		}*/

		/*var clearMap = function() {
			//console.log(tileSize);
			for(var x = 0; x < canvas.width / tileSize; x++) {
				for(var y = 0; y < canvas.height / tileSize; y++) {
					map[x][y].color = backgroundColor;
				}
			}
		}*/

		var populateSeeds = function() {
			seeds = [];

			for(var i = 0; i < numSeeds; i++) {

				let num1 = randInt(0, Math.floor(canvas.width / tileSize) - 1);
				let num2 = randInt(0, Math.floor(canvas.height / tileSize) - 1);
	
				seeds.push(maps[currentMap][num1][num2]);
				maps[currentMap][num1][num2].color = (seedColor == "random") ? randColor() : seedColor;
				drawRect(num1 * tileSize, num2 * tileSize, tileSize, tileSize, maps[currentMap][num1][num2].color);
			}
		}

		var refresh = function() {

			clearInterval(intervalPointer);

			if(speed > 0) {

				mapReady = false;
				document.getElementById("submitButton").style = "opacity: 20%;";

				intervalPointer = setInterval(iterate, speed);

				//populateMap();
				swapMaps()

				//console.log(currentMap);
				//console.log(maps[currentMap]);
				//console.log(maps[(currentMap + 1) % 2]);
				clearMap()
				populateSeeds();
				
				//drawMap();

			} else {
				//populateMap();
				mapReady = false;
				document.getElementById("submitButton").style = "opacity: 20%;";
				swapMaps()
				clearMap()
				populateSeeds();

				while(seeds.length > 0) {
					iterate();
				}

				//clearMap()
				drawMap();
			}
		}


		let w = divsOf(canvas.width);
		let h = divsOf(canvas.height);
		var divsOfScreen = new Set();

		h.forEach(function(num) {
			if(w.has(num)) {
				divsOfScreen.add(num);
			};
		});

		w.forEach(function(num) {
			if(h.has(num)) {
				divsOfScreen.add(num);
			};
		});

		//console.log(divsOfScreen);

		var pushChanges = function() {

			if(!mapReady) {
				return;
			}

			// Tile Size // 
			let newTileSize = parseInt(document.getElementById("tileSizeInput").value);
			while(!divsOfScreen.has(newTileSize)) {
				newTileSize++;
			}
			tileSize = newTileSize;

			// Number of Seeds //
			let newNumSeeds = document.getElementById("numSeedsInput").value;
			numSeeds = newNumSeeds;

			// Speed //
			let newSpeed = document.getElementById("speedInput").value;
			speed = newSpeed;
			
			// Seed Color //
			let newSeedColor = document.getElementById("seedColorInput").value;
			seedColor = newSeedColor;

			// Color Mixing Strength //
			let newMixingStrength = document.getElementById("mixingStrengthInput").value;
			mixingStrength = newMixingStrength;

			// refresh //
			refresh();
		}

		var drawMap = function() {
			maps[currentMap].forEach(function(array) {
				//console.log(array);
				array.forEach(function(e) {
					//console.log(e);
					drawRect(e.x * tileSize, e.y * tileSize, tileSize, tileSize, e.color);
				})
			});
		}

		var mixColor = function(oldString, strength) {

			let rgb = oldString.substring(4, oldString.length - 1).replace(/ /g, '').split(',');
			let shift = randInt(-1 * strength, strength);
			
			let part = randInt(0, 2);
			rgb[part] = (parseInt(rgb[part]) + shift).toString();

			//rgb[0] = (parseInt(rgb[0]) + randInt(-1 * strength, strength)).toString();
			//rgb[1] = (parseInt(rgb[1]) + randInt(-1 * strength, strength)).toString();
			//rgb[2] = (parseInt(rgb[2]) + randInt(-1 * strength, strength)).toString();

			return "rgb(" + rgb[0].toString() + ", "+ rgb[1].toString() + ", " + rgb[2].toString() + ")";  


		}

		let grid = [{x:1,y:0}, {x:-1,y:0}, {x:0,y:1}, {x:0,y:-1}];

		var iterate = function() {
			let newSeeds = [];
			seeds.forEach(function(s) {
		
				// iterate every neighbour
				for(var i = 0; i < grid.length; i++) {

					// if edge of screew continue
					if(s.x + grid[i].x < 0 || s.y + grid[i].y < 0) {
						continue;
					}
					if(s.x + grid[i].x >= canvas.width / tileSize || s.y + grid[i].y >= canvas.height / tileSize) {
						continue;
					}

					let current = maps[currentMap][s.x + grid[i].x][s.y + grid[i].y];

					if(current.color == backgroundColor) {

						newSeeds.push(s);

						if(randInt(0, 1) < 1) {
							newSeeds.push(current);
							current.color = mixColor(s.color, mixingStrength);
							drawRect(current.x * tileSize, current.y * tileSize, tileSize, tileSize, current.color);
						}
					}
				}

			});

			seeds = newSeeds.slice(0);

			if(seeds.length == 0 && !mapReady) {

				clearUnusedMap();

				mapReady = true;
				document.getElementById("submitButton").style = "opacity: 100%;";
				console.log("READY");
			}
			//console.log(mapReady);
		}

		var init = function() {
			initMaps();
			refresh();
			intervalPointer = setInterval(iterate, speed);
		}

		init();