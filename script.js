// jQuery is the link that connects user interactions with HTML5 Canvas
$("#canvas-container").click(function() {
	// spacebar to get custom message for recognized
	// if (e.keyCode == 32) {
	// 	$("#canvas-interface").css("opacity", "0");
	// 	setTimeout(function() {
	// 		$("#canvas-interface").css("opacity", "1");
	// 		$("#canvas-interface").html("Welcome back Casey! What about another selfie?");
	// 	}, 500);
	// }

	// crush and uncrush smiley face
	if (!crush) {
		crush = true;
		uncrush = false;
		eyes.idleState = 0;
		eyes.idleCounter = 0;
		$("#cover").css("height", canvas.height);
		$("#cover").css("width", canvas.width);
	} else if (crush) {
		crush = false;
		uncrush = true;
		eyes.idleState = 0;
		eyes.idleCounter = 0;
		$("#cover").css("height", "0");
		setTimeout(function() {
			uncrush = false;
		}, 3500);
	}
});

// frame timing function
(function () {
	var requestAnimationFrame = window.requestAnimationFrame || window.msRequestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame;
	window.requestAnimationFrame = requestAnimationFrame;
})();

// define canvas and its context
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

// canvas properties
canvas.width = $("#canvas-container").width();
canvas.height = window.innerHeight;

// mobile settings
var deviceMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)

// game settings
var fps = 60;
var friction = 0.95;
var pause = true;
var crush = false;
var uncrush = false;

// mouse
var mouse = {
	x: 0,
	y: 0,
	onCanvas: false,
	cursor: "default"
};

// get mouse position for desktop
function mousePositionDesktop(e) {
	if (!deviceMobile) {
		mouse.x = e.x - canvas.getBoundingClientRect().left;
		mouse.y = e.y - canvas.getBoundingClientRect().top;
	}
}

canvas.addEventListener("mousemove", mousePositionDesktop);

// toggle mouse.onCanvas and other variables for whether the mouse is on canvas
function mouseEnter() {
	mouse.onCanvas = true;
	pause = false;
	eyes.idleState = 0;
	eyes.idleCounter = 0;
	$("#canvas-interface").css("opacity", "1");
}

function mouseLeave() {
	mouse.onCanvas = false;
	$("#canvas-interface").css("opacity", "0");
}

canvas.addEventListener("mouseenter", mouseEnter);
canvas.addEventListener("mouseleave", mouseLeave);

// get mouse position for mobile
function mousePositionMobile(e) {
	// setting mouse coordinates
	var x = e.touches[0].clientX - canvas.getBoundingClientRect().left;
	var y = e.touches[0].clientY - canvas.getBoundingClientRect().top;

	return {
		x: x,
		y: y
	};
}

// keyboard control
var keysDown = {};

window.onkeydown = function(e) {
	keysDown[e.keyCode] = true;
}

window.onkeyup = function(e) {
	delete keysDown[e.keyCode];
}

// smiley face objects
// eyeball objects
// constructor
function Eyes(x) {
	this.x = x;
	this.y = canvas.height/2 - canvas.width/8;
	this.baseX = this.x;
	this.baseY = this.y;
	this.bounds = [[this.x - canvas.width/16, this.y - canvas.height/32], 
				   [this.x + canvas.width/16, this.y - canvas.height/32],
				   [this.x + canvas.width/16, this.y + canvas.height/64], 
				   [this.x - canvas.width/16, this.y + canvas.height/64]];
	this.leftSpacing = canvas.width/6;
	this.rightSpacing = canvas.width/6;
	this.baseSpacing = this.leftSpacing;
	this.velX = 0;
	this.velY = 0;
	this.radius = canvas.width/25;
	this.baseRadius = this.radius;
	this.blinkCounter = 0;
	this.blinkTime = Math.random() * 100;
	this.blinkAngle = 0;
	this.idleState = 0;
	this.idleCounter = 0;
	this.bounceXDir = 0;
	this.bounceYDir = 0;
}

// instances
var eyes = new Eyes(canvas.width/2);

// methods
// check if x and y are within boundaries
Eyes.prototype.inBounds = function() {
	return this.x >= this.bounds[0][0] && this.x <= this.bounds[1][0] && this.y >= this.bounds[0][1] && this.y <= this.bounds[2][1];
}

// update
Eyes.prototype.tick = function() {
	this.velX *= friction;
	this.velY *= friction;
	this.x += this.velX;
	this.y += this.velY

	// eyes follow mouse
	if (!crush && !uncrush && mouse.onCanvas && Math.pow(this.x - mouse.x, 2) + Math.pow(this.y - mouse.y, 2) > canvas.width/100 && this.inBounds()) {
		var dirX = (mouse.x - this.x)/50;
		var dirY = (mouse.y - this.y)/50;

		this.velX = dirX;
		this.velY = dirY;

		// eyes dilate if mouse detected
		if (this.radius < this.baseRadius * 1.1) {
			this.radius += canvas.width/800;
		} 

		// eye spacing decreases to follow mouse
		if (mouse.x > this.x && this.leftSpacing > this.baseSpacing * 0.75) {
			this.leftSpacing -= canvas.width/250;
		} else if (mouse.x < this.x && this.rightSpacing > this.baseSpacing * 0.75) {
			this.rightSpacing -= canvas.width/250;
		} 
	}

	// resets eye properties if no user interaction is occurring
	if (!crush && this.idleState != 2) {
		// reset x and y to be within set boundaries so that eyes don't go too far
		if (this.x < this.bounds[0][0]) {
			this.x = this.bounds[0][0];
			this.velX = 0;
		} else if (this.x > this.bounds[1][0]) {
			this.x = this.bounds[1][0];
			this.velX = 0;
		}

		if (this.y < this.bounds[0][1]) {
			this.y = this.bounds[0][1];
			this.velY = 0;
		} else if (this.y > this.bounds[2][1]) {
			this.y = this.bounds[2][1];
			this.velY = 0;
		}

		// reset eye properties when mouse leaves canvas
		if (!mouse.onCanvas && this.idleState != 2) {
			if (this.radius > this.baseRadius) {
				this.radius -= canvas.width/800;
			}

			// reset x and y to center
			if (this.x < this.baseX) {
				this.x += (this.baseX - this.x)/20;
			} else {
				this.x -= (this.x - this.baseX)/20;
			}

			if (this.y < this.baseY) {
				this.y += (this.baseY - this.y)/20;
			} else {
				this.y -= (this.y - this.baseY)/20;
			}

			// reset eye spacing
			if (this.leftSpacing < this.baseSpacing) {
				this.leftSpacing += canvas.width/500;
			}

			if (this.rightSpacing < this.baseSpacing) {
				this.rightSpacing += canvas.width/500;
			}
		}
	}

	// blink animation
	if (this.blinkCounter > this.blinkTime) {
		if (this.blinkAngle < Math.PI * 2) {
			this.blinkAngle += Math.PI/8; 
		} else if (this.blinkAngle > Math.PI) {
			this.blinkTime = 100 + Math.random() * 100;
			this.blinkAngle = 0;
			this.blinkCounter = 0;
		}
	} else {
		this.blinkCounter++;

		// handle idle states of smiley face with counter
		if (!mouse.onCanvas) {
			this.idleCounter++;

			if (this.idleCounter > 1500) {
				this.idleCounter = 0;
				this.idleState = 0;
				this.bounceXDir = 0
				this.bounceYDir = 0;
			} else if (this.idleCounter > 800) {
				this.idleState = 2;

				if (this.bounceXDir == 0 && this.bounceYDir == 0) {
					this.bounceXDir = 1;
					this.bounceYDir = 1;
				}
			} else if (this.idleCounter > 300 && this.idleCounter < 700) {
				this.idleState = 1;
			} else {
				this.idleState = 0;
				this.bounceXDir = 0
				this.bounceYDir = 0;
			}
		}
	}

	// crushing animation
	if (crush) {
		if (this.leftSpacing + this.rightSpacing < canvas.width * 0.65) {
			this.leftSpacing += canvas.width/500;
			this.rightSpacing += canvas.width/500;
		}

		if (this.x < this.baseX) {
			this.x += (this.baseX - this.x)/20;
		} else {
			this.x -= (this.x - this.baseX)/20;
		}

		if (this.y < canvas.height - canvas.height/16) {
			this.y += canvas.height/100;
		}
	}

	// uncrushing animation
	if (uncrush) {
		if (this.leftSpacing + this.rightSpacing > this.baseSpacing * 2) {
			this.leftSpacing -= canvas.width/500;
			this.rightSpacing -= canvas.width/500;
		}

		if (this.x < this.baseX) {
			this.x += (this.baseX - this.x)/20;
		} else {
			this.x -= (this.x - this.baseX)/20;
		}

		if (this.y < this.baseY) {
			this.y -= canvas.height/100;
		}
	}

	// idle animation
	if (!mouse.onCanvas && this.idleState == 1) {
		// have eyes oscillate left and right to look bored
		this.x = this.baseX + canvas.width/16 * Math.sin(this.idleCounter/80);

		// smile goes away
		if (mouth.curvature < mouth.baseCurvature * 0.25) {
			mouth.curvature += mouth.increment/5;
		}
	} else if (!mouse.onCanvas && this.idleState == 2) {
		// have smiley face bounce move the screen
		this.x += this.bounceXDir * canvas.width/600;
		this.y += this.bounceYDir * (canvas.height/canvas.width) * canvas.width/600;
		mouth.x = this.x;
		mouth.y = this.y + canvas.height/4;

		if (this.x > canvas.width - this.rightSpacing * 1.5) {
			this.bounceXDir = -1;
		} else if (this.x < this.leftSpacing * 1.5) {
			this.bounceXDir = 1;
		}

		if (this.y < 0) {
			this.bounceYDir = 1;
		} else if (this.y > canvas.height - canvas.height/4) {
			this.bounceYDir = -1;
		}

		if (mouth.curvature > mouth.baseCurvature) {
			mouth.curvature -= mouth.increment/5;
		}
	}
}

// render
Eyes.prototype.render = function() {
	// eyeballs
	ctx.fillStyle = "#fff";
	ctx.beginPath();
	ctx.arc(this.x - this.leftSpacing, this.y, this.radius, 0, 2 * Math.PI, false);
	ctx.fill();
	ctx.beginPath();
	ctx.arc(this.x + this.rightSpacing, this.y, this.radius, 0, 2 * Math.PI, false);
	ctx.fill();

	// rectangles for blinking animation
	ctx.fillStyle = "#0062ff"
	ctx.fillRect(this.x - this.leftSpacing - this.radius * 1.25, this.y - this.radius - 1, this.radius * 2.5, this.radius * 2 * Math.sin(this.blinkAngle));
	ctx.fillRect(this.x + this.rightSpacing - this.radius * 1.25, this.y - this.radius - 1, this.radius * 2.5, this.radius * 2 * Math.sin(this.blinkAngle));
}

// mouth object
function Mouth() {
	this.x = canvas.width/2;
	this.y = canvas.height/2 + canvas.width/8;
	this.baseX = this.x;
	this.baseY = this.y;
	this.bounds = [[this.x - canvas.width/48, this.y - canvas.height/48], 
				   [this.x + canvas.width/48, this.y - canvas.height/48],
				   [this.x + canvas.width/48, this.y + canvas.height/48], 
				   [this.x - canvas.width/48, this.y + canvas.height/48]];
	this.velX = 0;
	this.velY = 0;
	this.width = canvas.width/2;
	this.increment = 0.00005;
	this.curvature = -this.increment * 40;
	this.baseCurvature = this.curvature;
	this.thickness = this.width/20;
	this.numNodes = 100;
}

// instances
var mouth = new Mouth();

//methods
// check if x and y are within boundaries
Mouth.prototype.inBounds = function() {
	return this.x >= this.bounds[0][0] && this.x <= this.bounds[1][0] && this.y >= this.bounds[0][1] && this.y <= this.bounds[2][1];
}

// update
Mouth.prototype.tick = function() {
	this.velX *= friction;
	this.velY *= friction;
	this.x += this.velX;
	this.y += this.velY

	// follow mouse
	if (!crush && !uncrush && mouse.onCanvas && Math.pow(eyes.x - mouse.x, 2) + Math.pow(eyes.y - mouse.y, 2) > canvas.width/100 && eyes.inBounds()) {
		var dirX = (mouse.x - eyes.x)/1000;
		var dirY = (mouse.y - eyes.y)/1000;

		this.velX = dirX;
		this.velY = dirY;
	}

	// reset properties if no user interaction is occurring
	if (!crush && eyes.idleState != 2) {
		// set mouth to be inside proper boundaries
		if (this.x < this.bounds[0][0]) {
			this.x = this.bounds[0][0];
			this.velX = 0;
		} else if (this.x > this.bounds[1][0]) {
			this.x = this.bounds[1][0];
			this.velX = 0;
		}

		if (this.y < this.bounds[0][1]) {
			this.y = this.bounds[0][1];
			this.velY = 0;
		} else if (this.y > this.bounds[2][1]) {
			this.y = this.bounds[2][1];
			this.velY = 0;
		}

		// make face smile more when mouse enters
		if (mouse.onCanvas && this.curvature > this.baseCurvature * 1.5) {
			this.curvature -= this.increment * 2;
		}

		// reset smile and coordinates when moues leaves canvas.
		if (!mouse.onCanvas) {
			if (this.curvature < this.baseCurvature) {
				this.curvature += this.increment;
			}

			if (this.x < this.baseX) {
				this.x += (this.baseX - this.x)/50;
			} else {
				this.x -= (this.x - this.baseX)/50;
			}

			if (this.y < this.baseY) {
				this.y += (this.baseY - this.y)/50;
			} else {
				this.y -= (this.y - this.baseY)/50;
			}
		}
	}

	// crushing animation
	if (crush) {
		$("#canvas-interface").css("opacity", "0");
		if (this.curvature < -this.baseCurvature) {
			this.curvature += this.increment;
		}

		if (this.y < canvas.height - canvas.height/16) {
			this.y += canvas.height/100;
		}
	}

	// uncrushing animation
	if (uncrush) {
		if (this.curvature > this.baseCurvature) {
			this.curvature -= this.increment;
		}

		if (this.y > this.baseY) {
			this.y -= canvas.height/100;
		}
	}
}

// render
Mouth.prototype.render = function() {
	ctx.fillStyle = "#fff";
	ctx.strokeStyle = "#fff";
	ctx.lineWidth = this.thickness;

	// render many circles on part of the path of a parabola to get a smiley face
	for (var i = 0; i < this.numNodes; i++) {
		var x1 = this.x - (i - this.numNodes/2 + 0.5) * (this.width/this.numNodes);
		var x0 = this.x - (i - this.numNodes/2 - 0.5) * (this.width/this.numNodes);

		ctx.beginPath();
		ctx.arc(x1, this.curvature * Math.pow(x1 - this.x, 2) + this.y, this.thickness, 0, 2 * Math.PI, false);
		ctx.arc(x0, this.curvature * Math.pow(x0 - this.x, 2) + this.y, this.thickness, 0, 2 * Math.PI, false);
		ctx.fill();
	}
}

// update game
function tick() {
	render();

	if (!pause) {
		eyes.tick();
		mouth.tick();
	}

	// recalls tick at appropriate fps
	setTimeout(function() {
		requestAnimationFrame(tick)
	}, 1000/fps);
}

// render
function render() {
	// background
	ctx.fillStyle = "#0062ff";
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	// face
	eyes.render();
	mouth.render();
}

window.onload = function() {
	tick();
	render();
}