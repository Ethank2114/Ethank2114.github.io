// main.js
// Ethan Kerr


// Helper functions //

var drawRect = function(x, y, width, height, color) {
	frame.fillStyle = color;
	frame.fillRect(x, y, width, height);
}

var drawRect = function(frame, x, y, width, height, color) {
	frame.fillStyle = color;
	frame.fillRect(x, y, width, height);
}

var randInt = function(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

var randColor = function() {
	let r = randInt(0, 255);
	let g = randInt(0, 255);
	let b = randInt(0, 255);
	return "rgb(" + r.toString() + ", "+ g.toString() + ", " + b.toString() + ")"; 
}

var hexToRGB = function(hex) {
	let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  	return result ?  "rgb(" +
    	parseInt(result[1], 16) + ", " +
    	parseInt(result[2], 16) + ", " +
    	parseInt(result[3], 16) + ")"
  	 : null;
}

var mixColor = function(oldString, strength) {

	if(oldString[0] === "#") {
		oldString = hexToRGB(oldString);
	}
	
	let rgb = oldString.substring(4, oldString.length - 1).replace(/ /g, '').split(',');
	//let shift = randInt(-1 * strength, strength);
			
	//let part = randInt(0, 2);
	//rgb[part] = (parseInt(rgb[part]) + shift).toString();

	for(let i = 0; i < 2; i++) {
		rgb[i] = (parseInt(rgb[i]) + randInt(-1 * strength, strength)).toString();

		if(rgb[i] < 0) {
			rgb[i] = 0;
		}
		if(rgb[i] > 255) {
			rgb[i] = 255;
		}

		// while(rgb[i] < 0 || rgb[i] > 255) {
		// 	rgb[i] = randInt(0, 255);
		// }
	}

	return "rgb(" + rgb[0].toString() + ", "+ rgb[1].toString() + ", " + rgb[2].toString() + ")";  
}

//* Helper functions *//

//  Global Variables  //

margin = 100;
turnFactor = 0.02;
minSpeed = 0.25;
maxSpeed = 3;
avoidFactor = 0.002;
centerFactor = 0.00008;
matchFactor = 0.008;
mouseFactor = 0;//0.0001;

visRange = 100;
protRange = 25;

visRangeSquared = visRange * visRange;
protRangeSquared = protRange * protRange;

var mouse = {x: 0, y:0};

// Global Variables //

class Boid {
	
	constructor(x = 0, y = 0, vel = {x: 0, y:0}, color = "rgb(0, 200, 200)") {
		this.x = x;
		this.y = y;
		this.velocity = vel;
		this.color = color
	}

	update(canvas, others) {

		this.dx = 0;
		this.dy = 0;
		this.distSquared = 0;
		this.closeDx = 0;
		this.closeDy = 0;
		this.xAvg = 0;
		this.yAvg = 0;
		this.vxAvg = 0;
		this.vyAvg = 0;
		this.neighbours = 0;

		// for every other boid
		others.forEach(function(e) {
			this.dx = this.x - e.x;
			this.dy = this.y - e.y;

			// if within visual range
			if(Math.abs(this.dx) < visRange && Math.abs(this.dy) < visRange) {
				this.distSquared = this.dx * this.dx + this.dy * this.dy;

				// if within protected range
				if(this.distSquared < protRangeSquared) {
					this.closeDx += this.dx;
					this.closeDy += this.dy;

				// if outside protected range
				} else if(this.distSquared < visRangeSquared) {
					this.xAvg += e.x;
					this.yAvg += e.y;
					this.vxAvg += e.velocity.x;
					this.vyAvg += e.velocity.y;

					this.neighbours += 1;
				}
			}
		}, this);

		// if neighbours found
		if(this.neighbours > 0) {
			this.xAvg /= this.neighbours;
			this.yAvg /= this.neighbours;
			this.vxAvg /= this.neighbours;
			this.vyAvg /= this.neighbours;

			this.velocity.x += (this.xAvg - this.x) * centerFactor
			this.velocity.y += (this.yAvg - this.y) * centerFactor

			this.velocity.x += (this.vxAvg - this.velocity.x) * matchFactor;
			this.velocity.y += (this.vyAvg - this.velocity.y) * matchFactor;

			this.velocity.x += (mouse.x - this.x) * mouseFactor;
			this.velocity.y += (mouse.y - this.y) * mouseFactor;

		}

		// Avoid others
		this.velocity.x += this.closeDx * avoidFactor;
		this.velocity.y += this.closeDy * avoidFactor;

		// edge avoidance
		if(this.x < margin) {
			this.velocity.x += turnFactor;
		}
		if(this.x > canvas.width - margin) {
			this.velocity.x -= turnFactor;
		}
		if(this.y < margin) {
			this.velocity.y += turnFactor;
		}
		if(this.y > canvas.height - margin) {
			this.velocity.y -= turnFactor;
		}

		// enfore min/max speed
		let vx = this.velocity.x;
		let vy = this.velocity.y;
		let speed = Math.sqrt(vx * vx + vy * vy);

		if(speed < minSpeed) {
			this.velocity.x *= minSpeed / speed;
			this.velocity.y *= minSpeed / speed;
		}
		if(speed > maxSpeed) {
			this.velocity.x *= maxSpeed / speed;
			this.velocity.y *= maxSpeed / speed;
		}

		// update position
		this.x += this.velocity.x;
		this.y += this.velocity.y;
	}

	render = (frame) => {

		let l = 25;

		let vMag = Math.sqrt(Math.pow(this.velocity.x, 2) + Math.pow(this.velocity.y, 2));
		let unit = {x: l * this.velocity.x / vMag, y: l * this.velocity.y / vMag};

		let normal = {x: -1 * unit.y / 3, y: unit.x / 3};

		// draw triangle
		frame.fillStyle = this.color;
		frame.beginPath();
		frame.moveTo(Math.round(this.x), Math.round(this.y));
		frame.lineTo(Math.round(this.x - unit.x + normal.x), Math.round(this.y - unit.y + normal.y));
		frame.lineTo(Math.round(this.x - unit.x - normal.x), Math.round(this.y - unit.y - normal.y));
		
		frame.fill();

	}

}

class Game {
	constructor(canvas, speed) {
		this.canvas = canvas;
		this.frame = canvas.getContext("2d");
		this.speed = speed;
		this.entities = [];
		
		this.intervalPointer = setInterval(this.gameTick, this.speed);
	}

	// populate game with entities
	populate = (c = "random") => {
		
		this.entities = [];

		for(var i = 0; i < 500; i++) {
			let randX = randInt(0, canvas.width);
			let randY = randInt(0, canvas.height);

			let vx = randInt(-4, 4);
			let vy = randInt(-4, 4);

			let randV = {x: vx, y: vy};

			//let r = 100 + randInt(0, 155);
			//let g = 0;
			//let b = randInt(0, 255);

			var color;

			if(c == "random") {
				/*
				let r = 100 + randInt(0, 155);
				let g = 0;
				let b = randInt(0, 255);
			
				//let rgb = {r: 0, g: randInt(0,255), b:100 + randInt(0,155)}

				color = "rgb(" + r.toString() + "," + g.toString() + "," + b.toString() + ")";
				*/
				
				color = randColor();
			} else { 
				//console.log(color);
				color = mixColor(c, 25);
			}

			this.entities.push(new Boid(randX, randY, randV, color));
		}
	}

	update = () => {

		// update all entites
		this.entities.forEach(function(e) {
			e.update(this.canvas, this.entities);
		}, this)
	}

	render = () => {

		// resize canvas to window size 
		if(this.canvas.width != window.innerWidth - 16) {
			this.canvas.width = window.innerWidth - 16;
		}

		if(this.canvas.height != window.innerHeight - 16) {
			this.canvas.height = window.innerHeight - 16;
		}


		// clear canvas
		drawRect(this.frame,0,0,canvas.width, canvas.height, "rgb(40, 40, 35)");

		// draw all entities
		this.entities.forEach(function(e) {
			e.render(this.frame);
		}, this)

	}

	gameTick = () => {
		this.update();
		this.render();
	}

}

var gameSpeed = 1000 / 144;
var c = document.getElementById("canvas")
var theGame = new Game(c, gameSpeed);
theGame.populate("rgb(30, 100, 150)"); // "rgb(200,50,150)"

// Event Listeners // 

window.addEventListener("mousemove", function(event) {
	var canObj = c.getBoundingClientRect()
	mouse.x = event.clientX - canObj.left
	mouse.y = event.clientY - canObj.top
})

// Event Listeners // 