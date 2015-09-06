var x,
	y,
	dx			= 2,
	dy			= 4,
	WIDTH,
	HEIGHT,
	ctx,
	bullets		= Array(),
	enemies		= Array(),
	spaceDown	= false,
	leftDown	= false,
	rightDown	= false,
	rotate		= true,
	angle		=  0,
	fire		= true,
	canvas,
	gameRun;


/*CONFIG*/
enemySpeed	= .5
fireSpeed	= 180;

$(document).ready(function(){			
	$(window).load(function(evt){
		canvas = $('#canvas');
		windowResize(evt);
		init();
	});
	$(window).resize(windowResize);
	$(document).keydown(onKeyDown);
	$(document).keyup(onKeyUp);

});

function windowResize(evt){
	WIDTH = $(window).width();
	HEIGHT = $(window).height();
	x = WIDTH/2;
	y = HEIGHT/2;
	canvas.attr('width', WIDTH);
	canvas.attr('height', HEIGHT);
	for(var i = 0; i < enemies.length; i++){
		var enemy = enemies[i];
		var distanceX = WIDTH /2 - enemy.x;
		var distanceY = HEIGHT /2 - enemy.y;
		enemy.dx = distanceX/1000;
		enemy.dy = distanceY/1000;
	}
}

function init() {

	ctx = canvas[0].getContext("2d");
	WIDTH = canvas.width();
	HEIGHT = canvas.height();
	createEnemies();
	updateScore();
	//numberStars = Math.round(WIDTH * HEIGHT * .001);
	createStarField();
	drawStars();
	gameRun = setInterval(draw, 10);
}

function circle(x,y,r,color) {
	ctx.beginPath();
	ctx.arc(x, y, r, 0, Math.PI*2, true);
	ctx.closePath();
	ctx.fillStyle = color;
	ctx.fill();
}


function rect(x,y,w,h,color,stroke,strokeColor) {
	ctx.beginPath();
	ctx.rect(x,y,w,h);
	ctx.closePath();
	ctx.fillStyle = color;
	
	if(stroke) {
		ctx.strokeStyle = strokeColor;
		ctx.lineWidth=stroke;
		ctx.stroke();
	}
	ctx.fill();
}

function clear() {
	ctx.clearRect(0, 0, WIDTH, HEIGHT);
}
		 
function onKeyDown(evt) {
	if (evt.keyCode == 39) rightDown = true;
	else if (evt.keyCode == 37) leftDown = true;
	else if (evt.keyCode == 32) spaceDown = true;
	else if (evt.keyCode == 81) {
		clearInterval(gameRun);
		clearTimeout(newEnemies);
	}
}

function onKeyUp(evt) {
	if (evt.keyCode == 39) rightDown = false;
	else if (evt.keyCode == 37) leftDown = false;
	else if (evt.keyCode == 32) spaceDown = false;
}
	
function draw() {

	clear();

	 // ctx.putImageData(imgData,0,0);
	 // imgData=ctx.getImageData(0,0,WIDTH,HEIGHT);

	drawStars();
	rect(x-10, y-10, 20, 20, '#FFFFFF');
	

	if(rightDown && rotate){
		rotate = false;
		angle -= Math.PI / 64;
		setTimeout(function(){rotate = true;},50)
	}
	else if(leftDown && rotate){
		rotate = false;
		angle += Math.PI / 64;
		setTimeout(function(){rotate = true;},50)
	}
	if(fire){
		fire = false;
		bullets.push(
			new Bullet(5 * Math.cos((Math.PI)/2 - angle),5 * Math.sin( (Math.PI)/2 + angle)),
			new Bullet(5 * Math.cos(-1 * (Math.PI)/2 - angle),5 * Math.sin( -1 * (Math.PI)/2 + angle)),
			new Bullet(5 * Math.sin((Math.PI)/2 - angle),5 * Math.cos( (Math.PI)/2 + angle)),
			new Bullet(5 * Math.sin(-1 * (Math.PI)/2 - angle),5 * Math.cos( -1 * (Math.PI)/2 + angle))
		);
		setTimeout(function(){fire = true;},fireSpeed)
	}

	for(var i= 0; i < bullets.length; i++){
		var bullet = bullets[i];
		if(spaceDown){
			bullet.x += bullet.dx/5;
			bullet.y += bullet.dy/5;
		}
		else {
			bullet.x += bullet.dx;
			bullet.y += bullet.dy;
		}
		if( (bullet.x < 0 || bullet.x > WIDTH + 5) || (bullet.y < 0 || bullet.y > HEIGHT + 5)){
			bullets.splice(i, 1);
			i--; //since it removes the bullet from the array
		}
		else
			bullet.draw();
	}
	var hit = false;
	for(var i = 0; i < enemies.length; i++){
		var enemy = enemies[i];
		if(Math.abs(Math.max(enemy.knockbackX, enemy.knockbackY)) > .01){
				enemy.x += enemy.knockbackX;
				enemy.knockbackX = enemy.knockbackX*.9;
				enemy.y +=  enemy.knockbackY;
				enemy.knockbackY = enemy.knockbackY*.9;
		}
		else {
			enemy.y += enemy.dy;
			enemy.x += enemy.dx;
		}
		enemy.draw();
		for(var j= 0; j < bullets.length; j++){
			var bullet = bullets[j];
			if(rect_collision(enemy.x, enemy.y, enemy.width, bullet.x, bullet.y, bullet.width)) {
				if(!hit){
					//
					enemy.x += 5;
					enemy.y += 5;
					score += 100 - enemy.width/10;
					enemy.width -= 10;
					enemy.height -= 10;
					/*enemy.knockbackX = enemy.dx * -5;
					enemy.knockbackY = enemy.dy * -5;*/
					enemy.knockbackX = bullet.dx;
					enemy.knockbackY = bullet.dy;
					if(enemy.width === 0){
						enemies.splice(i,1);
						i--;	
					}
					var distanceX = WIDTH /2 - enemy.x;
					var distanceY = HEIGHT /2 - enemy.y;
					// enemy.dx = distanceX/500;
					// enemy.dy = distanceY/500;
					enemySpeed = Math.abs(enemy.dx) + Math.abs(enemy.dy);
					enemy.dx = (distanceX/1000) * enemySpeed / (Math.abs(distanceX/1000)+Math.abs(distanceY/1000))
					enemy.dy = (distanceY/1000) * enemySpeed / (Math.abs(distanceX/1000)+Math.abs(distanceY/1000))
					//console.log(Math.abs(enemy.dx) + Math.abs(enemy.dy));
					hit = true;
					
				}
				bullets.splice(j,1);
				j--;				
			}
		}
		if(rect_collision(enemy.x, enemy.y, enemy.width, x-10, y-10, 20)){
			clearInterval(gameRun);
			clearTimeout(newEnemies);
		}
	}
	ctx.font = '20px "Press Start 2P"';
	ctx.textBaseline = 'top';
	ctx.fillStyle = '#ffffff';
	ctx.fillText('Score:' + score, 10, 10);
}

var numberStars = 500;
var stars = Array(numberStars);
var score = 0;
function updateScore(){
	score += 10;
	setTimeout(updateScore, 5000);
}

function star(x, y, width, stroke){
	this.x = x;
	this.y = y;
	this.width = width;
	this.height = width;
}

star.prototype.blink = function(){

};

star.prototype.draw = function(){
	rect(this.x, this.y, this.width, this.height, '#000099');
};


function createStarField(){
	for(var i = 0; i < numberStars; i++){
		//stars[i] = (new star(rand(WIDTH), rand(HEIGHT), rand(5)));
		stars[i] = Array(5);
		stars[i][0] = rand(WIDTH);
		stars[i][1] = rand(HEIGHT);
		stars[i][2] = rand(5);
		stars[i][3] = rand(50);
	}
}
function rand(range){
	return Math.floor(Math.random()*range) + 1;
}
function drawStars(){
	for(var i = 0; i < numberStars; i++){
		rect(stars[i][0], stars[i][1], stars[i][2], stars[i][2], '#000099');//, stars[i][3], '#000033');
	}
	//imgData=ctx.getImageData(0,0,WIDTH,HEIGHT);
}

var imgData;

rect_collision = function(x1, y1, size1, x2, y2, size2) {
	var bottom1, bottom2, left1, left2, right1, right2, top1, top2;
	left1 = x1;// - size1;
	right1 = x1 + size1;
	top1 = y1;// - size1;
	bottom1 = y1 + size1;
	left2 = x2;// - size2;
	right2 = x2 + size2;
	top2 = y2;// - size2;
	bottom2 = y2 + size2;
	return !(left1 > right2 || left2 > right1 || top1 > bottom2 || top2 > bottom1);
};

function Bullet(dx, dy) {
	this.x = x - 2; 
	this.y = y - 2;
	this.width = 5;
	this.height = 5;
	this.dx = dx;
	this.dy = dy;
}
Bullet.prototype.draw = function() {
	rect(this.x, this.y, this.width, this.height,'#FFFFFF');
};
var newEnemies;
function createEnemies(){
	enemies.push(new Enemy());
	newEnemies = setTimeout(createEnemies, (Math.floor(Math.random()*20) + 1)*50 );
}

function Enemy(){

	this.width = (Math.floor(Math.random()*6) + 1 ) * 10 ; 
	this.height = this.width;
	this.x = Math.ceil(Math.random()*(WIDTH + 2*this.width)) -this.width ;
	this.y = (this.x > (0-this.width) || this.x < (WIDTH + this.width) ) ? Math.round(Math.random()) * (HEIGHT + this.height) - this.height  : Math.floor(Math.random()*HEIGHT) + 1 ;
	var distanceX = WIDTH /2 - this.x;
	var distanceY = HEIGHT /2 - this.y;
	this.dx = distanceX/1000;
	//this.dx = (distanceX/1000) * enemySpeed / (Math.abs(distanceX/1000)+Math.abs(distanceY/1000))
	this.dy = distanceY/1000;
	//this.dy = (distanceY/1000) * enemySpeed / (Math.abs(distanceX/1000)+Math.abs(distanceY/1000))
	//console.log(Math.abs(this.dx) + Math.abs(this.dy));
	this.knockbackX = 0;
	this.knockbackY = 0;
}
Enemy.prototype.draw = function() {
	rect(this.x, this.y, this.width, this.height, '#FF0000');
};

// for(var i = 0; i < enemies.length; i++){
// 	if(enemies[i].knockbackY || enemies[i].knockbackX ) console.log(i);
// }