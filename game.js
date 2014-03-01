var canvas = document.getElementById("game_canvas");
var context = canvas.getContext("2d");
canvas.width = 1600*0.6;
canvas.height = 900*0.6;
canvas.style.width = canvas.width;
canvas.style.height = canvas.height;
canvas.style.position = "absolute";

var body_width = document.body.offsetWidth;
var body_height = document.body.offsetHeight;
canvas.style.left = (body_width - canvas.width)/2
canvas.style.top = (body_height - canvas.height)/2

var player;
var enemy;
var KEYS = [];
var game_interval;
document.body.onkeydown = function(evt)
{
	console.log("Key Down" + evt.keyCode);
	KEYS[evt.keyCode] = true;

	if(evt.keyCode === 32 && player.jump === false) // player jump
	{
		player.jump = true;
		player.v_y = -50;

		enemy.actions.push([TIMER + WAIT_TIME, "jump"]); // save player's action
	}
	if(evt.keyCode === 68) // d
	{
		player.move_right = true;
		enemy.actions.push([TIMER + WAIT_TIME, "move-left"]);
	}
	if(evt.keyCode === 83) // s
	{
		player.move_down = true;
		enemy.actions.push([TIMER + WAIT_TIME, "move-down"]);
	}
	if(evt.keyCode === 65) // a
	{
		player.move_left = true;
		enemy.actions.push([TIMER + WAIT_TIME, "move-right"]);
	}
	if(evt.keyCode === 87) // w
	{
		player.move_up = true;
		enemy.actions.push([TIMER + WAIT_TIME, "move-up"]);
	}
}
document.body.onkeyup = function(evt)
{
	console.log("Key Up: " + evt.keyCode);
	KEYS[evt.keyCode] = false;

	if(KEYS[68] === false)
	{
		player.move_right = false;
		enemy.actions.push([TIMER + WAIT_TIME, "stop-move-left"]);
	}
	if(KEYS[83] === false)
	{
		player.move_down = false;
		enemy.actions.push([TIMER + WAIT_TIME, "stop-move-down"]);
	}
	if(KEYS[65] === false)
	{
		player.move_left = false;
		enemy.actions.push([TIMER + WAIT_TIME, "stop-move-right"]);
	}
	if(KEYS[87] === false)
	{
		player.move_up = false;
		enemy.actions.push([TIMER + WAIT_TIME, "stop-move-up"]);
	}

}
function getMousePos(canvas, evt) {
	var rect = canvas.getBoundingClientRect();
		return {
		  x: evt.clientX - rect.left,
		  y: evt.clientY - rect.top
	};
}
// mouse event
// click mouse to shoot
canvas.addEventListener("mousedown", 
	function(evt)
	{	var mousePos = getMousePos(canvas, evt);
		var message = 'Mouse position: ' + mousePos.x + ',' + mousePos.y;
		console.log(message);
		// create new bullet
		var bullet = new Bullet(player.x, player.y, mousePos.x, mousePos.y);
		BULLETS.push(bullet);

		// save players action
		enemy.actions.push([TIMER + WAIT_TIME, "shoot", canvas.width/2 + (canvas.width/2 - player.x) - enemy.width, player.y, mousePos.x - canvas.width/2, mousePos.y])
	
	})

var BULLETS = [];
var Bullet = function(x, y, target_x, target_y)
{
	var gun_shot_sound = new Audio("./gun-shot.mp3") //document.getElementById("gun-shot-sound")
	gun_shot_sound.play();

	this.x = target_x>x? x + 60:x;
	this.y = y + 10;
	this.v_x = target_x>x?8:-8;

	// determin v_y
	var t = (target_x - x) / this.v_x;
	this.v_y = (target_y - y) / t;

	// this.v_y = 0;
	this.width = 8;
	this.height = 8;
	this.target_x = target_x;
	this.target_y = target_y;
	this.update = function()
	{
		this.x = this.x + this.v_x;
		this.y = this.y + this.v_y;
	}
	this.draw = function()
	{
		context.rect(this.x, this.y, this.width, this.height);
		context.stroke();
	}
}
var Player = function()
{
	this.height = 60;
	this.width = 60;
	this.x = 40;
	this.y = canvas.height/2 * 1.3;
	this.ground = this.y; // ground 
	this.v_x = 0;
	this.v_y = 0;
	this.g = 5;
	this.jump_height = 80; // can jump 80 pixels
	this.jump = false;

	this.move_right = false;
	this.move_left = false;
	this.move_up = false;
	this.move_down = false;



	this.hits = 0; 
	this.energy = 50; // can only fly 5 seconds energy,
	this.max_energy = 50;

	this.draw = function()
	{
		context.rect(this.x, this.y, this.width, this.height);
		context.stroke();

		// draw hp
		context.font="20px Arial";
		context.fillText("HITS: " + this.hits + " ENERGY: " + this.energy, this.x, this.y - 10);
	}

	this.update_move_right = function()
	{
		// check energy
		if(this.energy <= 0)
		{
			this.energy = 0;
			this.move_right = false;
			this.jump = true; // fall down
			return;
		}

		this.x += 5;
		if(this.x >= canvas.width)
			this.x = canvas.width - this.width
	}
	this.update_move_left = function()
	{
		// check energy
		if(this.energy <= 0)
		{
			this.energy = 0;
			this.move_left = false;
			this.jump = true; // fall down
			return;
		}
		this.x -= 5;
		if(this.x <=0 )
			this.x = 0;
	}
	this.update_move_up = function()
	{
		// check energy
		if(this.energy <= 0)
		{
			this.energy = 0;
			this.move_up = false;
			this.jump = true; // fall down
			return;
		}

		this.y -= 5;
		if(this.y <= 0)
			this.y = 0;
	}
	this.update_move_down = function()
	{
		// check energy
		if(this.energy <= 0)
		{
			this.energy = 0;
			this.move_down = false;
			this.jump = true; // fall down
			return;
		}

		this.y += 5;
		if(this.y >= canvas.height)
			this.y = canvas.height - this.height;
	}

	this.update_jump = function()
	{
		this.v_y = this.v_y + this.g
		this.y = this.y + this.v_y;
		if(this.y >= this.ground)
		{
			this.jump = false;
			this.y = this.ground;
			this.v_y = 0;
			return;
		}
	}

	this.check_energy = function()
	{
		// 消耗energy
		if(this.y != this.ground)
			this.energy -= 0.25;
		else
		{
			if(this.energy < this.max_energy)
				this.energy += 0.25;
		}
	}
}

var Enemy = function()
{
	// almost the same as Player
	// except for x, y
	this.height = 60;
	this.width = 60;
	this.x = canvas.width - 40 - this.width;
	this.y = canvas.height/2 * 1.3;
	this.ground = this.y; // ground 
	this.v_x = 0;
	this.v_y = 0;
	this.g = 5;
	this.jump_height = 80; // can jump 80 pixels
	this.jump = false;

	this.move_right = false;
	this.move_left = false;
	this.move_up = false;
	this.move_down = false;

	this.hits = 0;

	// save actions
	// [[time, "jump"], [time, "shoot", x, y, target_x, target_y]];
	// [time, "move-left"], [time, "move-right"], [time, "move-up"], [time, "move-down"];
	// [time, "stop-move-left"]
	this.actions = []; 

	this.draw = function()
	{
		context.rect(this.x, this.y, this.width, this.height);
		context.stroke();

		// draw hp
		context.font="20px Arial";
		context.fillText("HITS: " + this.hits, this.x, this.y - 10);
	}

	this.update_move_right = function()
	{
		this.x += 5;
		if(this.x >= canvas.width)
			this.x = canvas.width - this.width
	}
	this.update_move_left = function()
	{
		this.x -= 5;
		if(this.x <=0 )
			this.x = 0;
	}
	this.update_move_up = function()
	{
		this.y -= 5;
		if(this.y <= 0)
			this.y = 0;
	}
	this.update_move_down = function()
	{
		this.y += 5;
		if(this.y >= canvas.height)
			this.y = canvas.height - this.height;
	}

	this.update_jump = function()
	{
		this.v_y = this.v_y + this.g
		this.y = this.y + this.v_y;
		if(this.y >= this.ground)
		{
			this.jump = false;
			this.y = this.ground;
			this.v_y = 0;
			return;
		}
	}
}


var Timer = function(total_time)
{
	this.t = total_time;
	this.draw = function()
	{
		context.font="30px Arial";
		var text = "Time Remaining: " + Math.floor(this.t/1000) + " s";
		context.fillText(text , 40, 40);
	}


}
function clearScreen()
{
	// context.clearRect(0, 0, canvas.width, canvas.height);
	canvas.width = canvas.width;
}

player = new Player();
enemy = new Enemy();
var TIMER = 0; // used to save elapsed time
var timer = new Timer(10000); // ms
var WAIT_TIME = 1000;
function beginGame() 
{
	TIMER += 25;
	clearScreen(); // clear screen

	if(TIMER % 1000 === 0)
	{
		console.log(TIMER / 1000 + "s");
	}

	// check energy
	player.check_energy();

	if(player.jump === true) // check player jump
	{
		console.log("Player Jump");
		player.update_jump();
	}
	if(player.move_right === true) // player move right
		player.update_move_right();
	if(player.move_left === true) // player move right
		player.update_move_left();
	if(player.move_up === true) // player move up
		player.update_move_up();
	if(player.move_down === true) // player move down
		player.update_move_down();

	if(enemy.jump === true) // check enemy jump
	{
		console.log("@Enemy Jump");
		enemy.update_jump();
	}
	if(enemy.move_right === true) // enemy move right
		enemy.update_move_right();
	if(enemy.move_left === true) // enemy move right
		enemy.update_move_left();
	if(enemy.move_up === true) // enemy move up
		enemy.update_move_up();
	if(enemy.move_down === true) // enemy move down
		enemy.update_move_down();

	// draw timer
	timer.t -= 25;
	if(timer.t <= 0) // game over
	{
		timer.t = 0;
		timer.draw();
		// clearInterval(game_interval);
	}
	timer.draw();

	// draw player
	player.draw();
	// draw enemy
	enemy.draw();

	// check enemy action
	for(var i = 0; i < enemy.actions.length; i++)
	{
		if(enemy.actions[i][0] > TIMER) break;
		if(enemy.actions[i][0] === TIMER) // same to timer
		{
			var action = enemy.actions[i];
			if(action[1] === "jump") // enemy jump
			{
				console.log("ENEMY JUMP");
				enemy.jump = true;
				enemy.v_y = -50;
				enemy.update_jump();
			}
			if(action[1] === "shoot") // enemy shoot
			{
				// create bullet
				var bullet = new Bullet(action[2], action[3], action[4], action[5]);
				BULLETS.push(bullet);
			}
			if(action[1] === "move-left") // enemy move left
				enemy.move_left = true;
			if(action[1] === "stop-move-left") // enemy stop move left
				enemy.move_left = false;
			if(action[1] === "move-right") // enemy move right
				enemy.move_right = true;
			if(action[1] === "stop-move-right") // enemy stop move right
				enemy.move_right = false;
			if(action[1] === "move-up") // enemy move up
				enemy.move_up = true;
			if(action[1] === "stop-move-up") // enemy stop move up
				enemy.move_up = false;
			if(action[1] === "move-down") // enemy move down
				enemy.move_down = true;
			if(action[1] === "stop-move-down") // enemy stop move down
				enemy.move_down = false;
		}
	}

	// draw bullets
	for(var i = 0; i < BULLETS.length; i++)
	{
		var bullet = BULLETS[i];
		// update bullet position
		bullet.update();
		
		// 检查击中
		if(bullet.x >= enemy.x && bullet.x <= enemy.x + enemy.width
			&& bullet.y >= enemy.y && bullet.y <= enemy.y + enemy.height)
		{
			BULLETS.splice(i, 1); // delete bullet
			player.hits++;
			console.log("You hit by yourself");
			continue;
		}
		if(bullet.x >= player.x && bullet.x <= player.x + player.width
			&& bullet.y >= player.y && bullet.y <= player.y + player.height)
		{
			BULLETS.splice(i, 1); // delete bullet
			enemy.hits ++ ;
			console.log("You are hit by yourself");
			continue;
		}

		BULLETS[i].draw();
		if(BULLETS[i].x >= canvas.width || BULLETS[i].y >= canvas.height
			|| BULLETS[i].x <=0 || BULLETS[i].y <=0)
		{
			console.log("delete bullet");
			BULLETS.splice(i, 1);
		}
	}
}

game_interval = setInterval(beginGame, 25)





