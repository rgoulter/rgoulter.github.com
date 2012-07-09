var KeyCodes = {LEFT: 37, UP: 38, RIGHT: 39, DOWN: 40, CTRL: 17};

/**
* An object to look after game animation/movement.
*/
function GameEngine(canvas){
	var GE = {};

	var context;
	var keysPressed = [];
	var ships = [];
	var movable = [];
	var renderable = [];
	var player = null;
	var gamePaused = true;



	/*
	 Sets up the GameEngine with the document and supplied canvas.
	*/
	var init = function(){
	  setCanvas(canvas);
	  
	  document.onkeyup = keyup;
	  document.onkeydown = keydown;
	};



	var setCanvas = function(c){
	  canvas = c;
	  context = c.getContext("2d");
	};



	var clearWorld = function(){
	  player =  null;
	  ships = [];
	  movable = [];
	  renderable = [];
	}



	// Sets up a game world.
	var newGame = function(){
	  clearWorld();
	  
	  var ship = new SpaceShip(null, {x: canvas.width / 2, y: canvas.height / 2})
	  ships[0] = ship;
	  player = ship;
	  movable.push(player);
	  renderable.push(player);
	  
	  addAsteroids(4);
	};



	//Adds n asteroids to the game
	var addAsteroids = function(n){
	  for(var i = 0; i < n; i++){
		var args = {};
		
		do {
		  //Set x and y, but not too close to centre
		  args.x = Math.random() * canvas.width;
		  args.y = Math.random() * canvas.width;
		} while(Math.abs(canvas.width / 2 - args.x) < 20 &&
				Math.abs(canvas.height / 2 - args.y) < 20);
		
		args.rockSize = Math.floor(Math.random() * 3) + 8;
		var aster = new Asteroid(null, args);
		
		movable.push(aster);
		renderable.push(aster);
	  }
	};




	// Start/Resume game animation.
	var start = function(){
	  if(gamePaused){
		gamePaused = false;
		var date = new Date();
		var time = date.getTime();
		tick(time);
	  }
	};



	var tick = function tick(lastTime){
	  var date = new Date();
	  var time = date.getTime();
	  var delta = time - lastTime;
	  
	  move(delta);
	  render();
	  
	  //Call function again
	  if(!gamePaused){
		window.setTimeout(tick, 1000/30, time);
	  }
	};



	/*
	 Move game entities, and check collisions.
	 O(n^2)
	*/
	var move = function(delta){
	  handlePlayerInput();
	  
	  for(var i = 0; i < movable.length; i++){
		if(movable[i]){
		  var mover = movable[i];
		  
		  mover.move(delta);
		  ensureWithinBounds(mover);
		  
		  if(mover.collidesWith){
			for(var j = 0; j < movable.length; j++){
			  if(i === j) continue;
			  
			  var other = movable[j];
			  
			  if(mover.collidesWith(other)){
				handleCollision(mover, other);
			  }
			}
		  }
		  
		  //Check if items have expired.
		  if(mover.hasExpired && mover.hasExpired()){
			removeObject(mover);
		  }
		}
	  }
	};



	var handleCollision = function(obj1, obj2){
	  if(obj1.getObjectType() === ObjectTypes.SHIP && obj2.getObjectType() === ObjectTypes.ASTEROID ||
		 obj1.getObjectType() === ObjectTypes.ASTEROID && obj2.getObjectType() === ObjectTypes.SHIP){
		destroyObject(obj1);
		destroyObject(obj2);
	  }
	  
	  if((obj1.getObjectType() === ObjectTypes.BULLET && obj2.getObjectType() === ObjectTypes.ASTEROID) ||
		 (obj1.getObjectType() === ObjectTypes.ASTEROID && obj2.getObjectType() === ObjectTypes.BULLET)){
		destroyObject(obj1);
		destroyObject(obj2);
	  }
	};



	// Creates an explosion as well as removing it
	var destroyObject = function(movingObj){
	  removeObject(movingObj);
	  
	  if(movingObj.getObjectType() === ObjectTypes.ASTEROID){
		// Create Explosion
		var expl = new Explosion(null, {movingParent: movingObj, numParticles: 12, maxRadius: 70});
		movable.push(expl);
		renderable.push(expl);
		
		// Create more asteroids
		if(movingObj.getRockSize() > 7){
		  createAsteroidsFromAsteroid(movingObj);
		}
	  } else if(movingObj.getObjectType() === ObjectTypes.SHIP){
		var expl = new Explosion(null, {movingParent: movingObj, numParticles: 24, maxRadius: 100});
		movable.push(expl);
		renderable.push(expl);
	  }
	}



	var createAsteroidsFromAsteroid = function(movingObj){
	  var x = movingObj.getX();
	  var y = movingObj.getY();
	  
	  var n = Math.floor(Math.random() * 3) + 1;
	  for(var i = 0; i < n; i++){
		args = {};
		args.x = x;
		args.y = y;
		args.angle = 2 * Math.PI * Math.random();
		args.speed = (1 + 2 * Math.random()) * movingObj.getSpeed() / 3;
		args.rockSize = Math.floor(Math.random() * 2) + 5;
		
		var aster = new Asteroid(null, args);
		movable.push(aster);
		renderable.push(aster);
	  }
	};



	var removeObject = function(movingObj){
	  if(!movingObj.equals){
		throw "Expects object to have equals functionality.";
	  }
	  
	  function removeFromList(obj, list){
		for(var i = 0; i < list.length; i++){
		  if(obj.equals(list[i])){
			list.splice(i, 1);
			return;
		  }
		}
	  }
	  
	  removeFromList(movingObj, movable);
	  removeFromList(movingObj, renderable);
	}



	// Wrap around world
	var ensureWithinBounds = function(obj){
	  var x = obj.getX();
	  var y = obj.getY();
	  var prevX = obj.getPreviousX();
	  var prevY = obj.getPreviousY();
	  
	  if(x < 0){
		obj.setX(prevX + canvas.width);
		obj.setX(x + canvas.width);
	  }
	  if(x > canvas.width){
		obj.setX(prevX - canvas.width);
		obj.setX(x - canvas.width);
	  }
	  if(y < 0){
		obj.setY(prevY + canvas.height);
		obj.setY(y + canvas.height);
	  }
	  if(y > canvas.height){
		obj.setY(prevY - canvas.height);
		obj.setY(y - canvas.height);
	  }
	};



	var handlePlayerInput = function(){
	  if(!player) player = ships[0];
	  
	  if(isPressed(KeyCodes.LEFT)){ player.turnLeft(); }
	  if(isPressed(KeyCodes.RIGHT)){ player.turnRight(); }
	  if(isPressed(KeyCodes.UP)){ player.accelerate(); }
	  if(isPressed(KeyCodes.DOWN)){ player.decelerate(); }
	  
	  if(isPressed(KeyCodes.CTRL) && player.canShoot()){
		var shot = player.shoot();
		
		// add shots to game world
		movable.push(shot);
		renderable.push(shot);
	  }
	};



	/*
	 Render objects to canvas' context.
	*/
	var render = function(){
	  //Fill Background
	  context.fillStyle = "#00FFFF";
	  context.fillRect(0, 0, canvas.width, canvas.height);
	  
	  for(var i = 0; i < renderable.length; i++){
		if(renderable[i]){
		  renderable[i].render(context);
		}
	  }
	  
	  context.stroke();
	};



	// Record key press
	var keydown = function(evt){
	  var keyCode = (window.event) ? event.keyCode : evt.keyCode;
	  keysPressed[keyCode] = true;
	}



	// Record key release
	var keyup = function(evt){
	  var keyCode = (window.event) ? event.keyCode : evt.keyCode;
	  keysPressed[keyCode] = false;
	}



	// check whether the given keyCode is pressed
	var isPressed = function(keyCode){
	  return keysPressed[keyCode] === true;
	}



	GE.init = init;
	GE.newGame = newGame;
	GE.start = start;
	GE.pause = function(){ gamePaused = true; };
	GE.setCanvas = setCanvas;
	GE.isPressed = isPressed;

	return GE;
}