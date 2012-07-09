var ObjectTypes = {SHIP: 0, ASTEROID: 1, BULLET: 2, EXPLOSION: 3};

/*
A bullet that is fired from a ship. The ship is used for initial position and velocity.
This velocity doesn't change.
This augments the given movingObj with bullet functionality, or creates a new bullet if
no moving obj is given.

args expects shipParent
*/
function Bullet(movingObj, args){
	var SHOT_TIMEOUT = 750; // 1/2 second
	var SHOT_SPEED = 500; // must be larger than ship max speed.

	var shipParent = args.shipParent;

	// MobileObject Inheritance
	var mobjArgs = {x: shipParent.getX(),
					y: shipParent.getY(),
					angle: shipParent.getViewAngle(),
					speed: SHOT_SPEED};
	var shot = movingObj || new MovingObject(null, mobjArgs);
	var t = 0;
	var parent_move = shot.move; //inherited method;

	// RenderablePolygon Inheritance
	args.polyCoords = [[2, 0], [-1.4, -1.4], [-1.4, 1.4]];
	RenderablePolygon(shot, args);


	var move = function(delta){
	  parent_move(delta);
	  
	  t += delta;
	}



	shot.move = move;
	shot.hasExpired = function(){ return t >= SHOT_TIMEOUT; };
	shot.getObjectType = function(){ return ObjectTypes.BULLET; };

	return shot;
}






/*
An explosion for when things blow up.

args expects movingParent, numParticles, maxRadius
*/
function Explosion(movingObj, args){
	var EXPLOSION_TIMEOUT = 750; // 3/4 second
	var EXPLOSION_SPEED = 500; // arbitrary

	var movingParent = args.movingParent;
	var numParticles = args.numParticles;
	var maxRadius = args.maxRadius;

	// MobileObject Inheritance
	var mobjArgs = {x: movingParent.getX(),
					y: movingParent.getY(),
					angle: movingParent.getViewAngle(),
					speed: 0};
	var expl = movingObj || new MovingObject(null, mobjArgs);
	var t = 0;
	var parent_move = expl.move; //inherited method;

	var particlePoints = [];
	for(var i = 0; i < numParticles; i++){
	  particlePoints[i] = [];
	  particlePoints[i][0] = expl.getX();
	  particlePoints[i][1] = expl.getY();
	}



	var render = function(context){
	  for(var i = 0; i < particlePoints.length; i++){
		var p = particlePoints[i];
		context.rect(p[0], p[1], 1, 1);
		context.closePath();
	  }
	};



	var move = function(delta){
	  parent_move(delta);
	  
	  var length = maxRadius * delta / EXPLOSION_TIMEOUT;
	  var angleDiff = 2 * Math.PI / particlePoints.length;
	  
	  for(var i = 0; i < particlePoints.length; i++){
		particlePoints[i][0] += length * Math.cos(i * angleDiff);
		particlePoints[i][1] -= length * Math.sin(i * angleDiff);
	  }
	  
	  t += delta;
	}



	expl.render = render;
	expl.move = move;
	expl.hasExpired = function(){ return t >= EXPLOSION_TIMEOUT; };
	expl.getObjectType = function(){ return ObjectTypes.EXPLOSION; };

	return expl;
}






/*
Asteroid object.

args expects rockSize, and movingObject
*/
function Asteroid(movingObj, args){
	var MAX_ROCK_SPEED = 80;

	var rockSize = args.rockSize;

	// MovingObject Inheritance
	args.maxSpeed = args.maxSpeed ? Math.min(args.maxSpeed, MAX_ROCK_SPEED)
								  : MAX_ROCK_SPEED;
	args.speed = args.speed || Math.floor(Math.random() * MAX_ROCK_SPEED / 2) + MAX_ROCK_SPEED / 2; // 1/2 max < speed < max
	args.angle = args.angle || Math.random() * Math.PI * 2; //random angle
	var rock = movingObj || new MovingObject(null, args);

	// RenderablePolygon Inheritance
	args.polyCoords = makeAsteroidPolygon(rockSize, rockSize * 5);
	RenderablePolygon(rock, args);



	rock.getObjectType = function(){ return ObjectTypes.ASTEROID; };
	rock.getRockSize = function(){ return rockSize; };

	return rock;
}






/*
Creates a new Spaceship, or augments a moving object with Spaceship functionality.

Can shoot bullets.

args may have the arguments of moving object.
*/
function SpaceShip(movingObj, args){

	var SPEED_DECAY_RATE = 0.1; // Proportion of speed lost per second.
	var MAX_SHIP_SPEED = 150;
	var SHOT_DELAY = 2000; //1 second between shots.

	// MovingObject Inheritance
	args.maxSpeed = args.maxSpeed ? Math.min(args.maxSpeed, MAX_SHIP_SPEED)
								  : MAX_SHIP_SPEED;
	var ship = movingObj || new MovingObject(null, args);

	// RenderablePolygon Inheritance
	args.polyCoords = [ [15, 0],
						[Math.cos(Math.PI * 2/3) * 10, - Math.sin(Math.PI * 2/3) * 10],
						[-2, 0],
						[Math.cos(Math.PI * 4/3) * 10, - Math.sin(Math.PI * 4/3) * 10]];
	RenderablePolygon(ship, args);

	var shot_timeout = 0;
	var parent_move = ship.move; // Inherited method.



	var makeShot = function(){
	  if(shot_timeout <= 0){
		var shot = new Bullet(null, {shipParent: ship});
		shot_timeout = SHOT_DELAY;
		return shot;
	  } else {
		return false;
	  }
	}



	// Move the ship, decay speed, check when we can shoot or not.
	var move = function(delta){
	  parent_move(delta);
	  //console.log("child move");
	  
	  //Slow down. Approximate speed loss.
	  var currSpeed = ship.getSpeed();
	  var speedLost = currSpeed * SPEED_DECAY_RATE * delta / 1000;
	  ship.setSpeed(currSpeed - speedLost);
	  if(ship.getSpeed() < 1){
		//speed = 0;
	  }
	  
	  if(shot_timeout > 0){
		shot_timeout -= delta;
	  }
	}



	ship.move = move;
	ship.shoot = makeShot;
	ship.canShoot = function(){ return shot_timeout <= 0; };
	ship.getObjectType = function(){ return ObjectTypes.SHIP; };

	return ship;
}