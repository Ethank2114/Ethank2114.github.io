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

// Helper functions //

margin = 100;
turnFactor = 0.02;
minSpeed = 1;
maxSpeed = 1.5;
avoidFactor = 0.001;
centerFactor = 0.00008;
matchFactor = 0.008;

visRange = 100;
protRange = 25;

visRangeSquared = visRange * visRange;
protRangeSquared = protRange * protRange;

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

			this.velocity.x += (this.xAvg - this.x) * centerFactor + (this.vxAvg - this.velocity.x) * matchFactor;
			this.velocity.y += (this.yAvg - this.y) * centerFactor + (this.vyAvg - this.velocity.y) * matchFactor;
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

		// populate game with entities
		for(var i = 0; i < 500; i++) {
			let randX = randInt(0, canvas.width);
			let randY = randInt(0, canvas.height);

			let vx = randInt(-4, 4);
			let vy = randInt(-4, 4);

			let randV = {x: vx, y: vy};

			//let r = 100 + randInt(0, 155);
			//let g = 0;
			//let b = randInt(0, 255);

			let r = 0;
			let g = randInt(0, 255);
			let b = 100 + randInt(0, 155);

			//let rgb = {r: 0, g: randInt(0,255), b:100 + randInt(0,155)}

			let color = "rgb(" + r.toString() + "," + g.toString() + "," + b.toString() + ")";

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

		if(this.canvas.height != window.innerHeight - 46) {
			this.canvas.height = window.innerHeight - 46;
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

//var gameSpeed2 = 1000 / 144;
//var c2 = document.getElementById("canvas2")
//var theGame = new Game(c2, gameSpeed2);
