
/*
Creates or augments an object with Moving functionality.

args may contain x, y, speed, maxSpeed, angle.
*/
function MovingObject(someObj, args){
	// Default arguments
	var x = args.x || 0;
	var y = args.y || 0;
	var speed = args.speed || 0;
	var maxSpeed = args.maxSpeed || 10000;
	var viewAngle = args.angle || 0;

	var prevX = x;
	var prevY = y;

	var obj = someObj || {};
	var speedAngle = viewAngle;



	var move = function(delta){
	  //console.log("parent move " + x + "," + y + "," + speed + "," + speedAngle);
	  var k = delta / 1000;
	  
	  obj.setX(x + Math.cos(speedAngle) * speed * k);
	  obj.setY(y + -Math.sin(speedAngle) * speed * k); //-ve, since axis is inverted.
	}



	var adjustSpeed = function(ds){
	  // Current speed vector
	  var sx = Math.cos(speedAngle * speed);
	  var sy = Math.sin(-(speedAngle * speed));
	  
	  // Add vectors
	  sx += Math.cos(viewAngle) * ds;
	  sy += Math.sin(-viewAngle) * ds;
	  
	  var ts = Math.sqrt(sx*sx + sy*sy); // New Magnitude
	  speedAngle = Math.atan2(-sy, sx); //atan2??
	  speed = Math.max(0, Math.min(ts, maxSpeed));
	};



	var adjustAngle = function(da){
	  viewAngle += da;
	  
	  if(viewAngle < 0) viewAngle += 2*Math.PI;
	  if(viewAngle > 2*Math.PI) viewAngle -= 2*Math.PI;
	};



	var equals = function (o){
	  return o.getX && Math.abs(obj.getX() - o.getX()) < 0.0001 &&
			 o.getY && Math.abs(obj.getY() - o.getY()) < 0.0001 &&
			 o.getSpeed && Math.abs(obj.getSpeed() - o.getSpeed()) < 0.0001 &&
			 o.getViewAngle && Math.abs(obj.getViewAngle() - o.getViewAngle()) < 0.0001;
	};



	obj.setX = function(nx){ prevX = x; x = nx; };
	obj.getX = function(){ return x; };
	obj.getPreviousX = function(){ return prevX; };
	obj.setY = function(ny){ prevY = y; y = ny; };
	obj.getY = function(){ return y; };
	obj.getPreviousY = function(){ return prevY; };
	obj.setSpeed = function(ns){ speed = ns; };
	obj.getSpeed = function(){ return speed; };
	obj.getViewAngle = function(){ return viewAngle; };

	obj.accelerate = function(ds){ adjustSpeed(ds || 150); };
	obj.decelerate = function(ds){ adjustSpeed(-ds || -100); };

	obj.turnLeft = function(da){ adjustAngle(da || (Math.PI / 18)); };
	obj.turnRight = function(da){ adjustAngle(-da || (-Math.PI / 18)); };

	obj.move = move;
	obj.equals = equals;

	return obj;
}