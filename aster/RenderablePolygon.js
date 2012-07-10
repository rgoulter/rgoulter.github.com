/*
Creates or Augments an object so that it renders a polygon shape.
Object needs to be a moving object.

args may contain args for a moving object.
args expects polyCoords.

polyCoords is an array of [x,y] arrays. Do not repeat the last and first item.
*/
function RenderablePolygon(movingObj, args){
  var obj = movingObj || new MovingObject(null, args);
  var polyCoords = args.polyCoords;

  var mobj_equals = obj.equals;



  /*
   Calculates the polygon coordinates for the moving object,
   and returns the calculated value.
  */
  var calculatePolygonCoordinates = function(){
    // Transform point by movingObj's x, y, viewAngle.
    function transformPoint(p){
    // Rotate, then translate
    q = Geometry.rotatePoint(p, obj.getViewAngle());
    q = Geometry.translatePoint(q, obj.getX(), obj.getY());
    
    return q;
    }
    
    return polyCoords.map(transformPoint);
  }



  /*
   Returns a box which is the minimal rectangle which contains all
   vertices of the polygon.
   
   Time complexity O(n), by number of points.
   
   The box is returned in form of [x, y, w, h].
  */
  var calculateBoundingBox = function(){
    var coords = calculatePolygonCoordinates();
    var minX = coords[0][0], maxX = coords[0][0];
    var minY = coords[0][1], maxY = coords[0][1];
    
    for(var i = 1; i < coords.length; i++){
      var tx = coords[i][0];
      var ty = coords[i][1];
      
      if(tx < minX){
        minX = tx;
      } else if(tx > maxX){
        maxX = tx;
      }
      
      if(ty < minY){
        minY = ty;
      } else if(ty > maxY){
        maxY = ty;
      }
    }
    
    var width = maxX - minX;
    var height = maxY - minY;
    
    return [minX, minY, width, height];
  }



  // Checks whether this collides with another RenderablePolygon
  // O(mn) time complexity.
  var collidesWith = function(polyObj){
    // Check that the other object has the right methods
    if(!polyObj.getBoundingBox || !polyObj.calculatePolygonCoordinates){
      return false;
    }
    
    // Check whether the bounding boxes overlap before
    // calculating whether they intersect.
    // O(m + n)
    var rectA = obj.getBoundingBox();
    var rectB = polyObj.getBoundingBox();
    var collisionMightExist = (rectA[0] + rectA[2] >= rectB[0] && rectA[0] <= rectB[0] + rectB[2]) &&
                              (rectA[1] + rectA[3] >= rectB[1] && rectA[1] <= rectB[1] + rectB[3]);
    
    if(!collisionMightExist){
    //return false;
    }
    
    // A collision might exist,
    // check that it does.
    // O(mn)
    var poly1 = obj.calculatePolygonCoordinates();
    var poly2 = polyObj.calculatePolygonCoordinates();
    return  Geometry.linePolygonIntersect([[obj.getPreviousX(), obj.getPreviousY()],
                      [obj.getX(), obj.getY()]],
                       poly2) ||
            Geometry.linePolygonIntersect([[polyObj.getPreviousX(), polyObj.getPreviousY()],
                           [polyObj.getX(), polyObj.getY()]],
                            poly1) ||
            Geometry.polygonsIntersect(poly1, poly2);
  }



  var render = function(context){
    var x = movingObj.getX();
    var y = movingObj.getY();
    var va = movingObj.getViewAngle();
    
    context.beginPath();
    
    // Angle here, 0 is at EAST, PI/2 is at NORTH.
    var coords = calculatePolygonCoordinates();
    
    context.moveTo(coords[0][0], coords[0][1]);
    for(var i = 1; i < polyCoords.length; i++){
      context.lineTo(coords[i][0], coords[i][1]);
    }
    context.lineTo(coords[0][0], coords[0][1]);
    
    context.lineWidth = 2;
    context.closePath();
    context.stroke();
    
    //Fill in the shape
    //context.fillStyle = "#FF0000";
    //context.fill();
  }



  var equals = function (o){
    // Check mobj equality first.
    if(!mobj_equals(o)){
      return false;
    }
    
    var o_coords = o.getPolygonCoordinates();
    
    if(polyCoords.length != o_coords.length){ // same number of coords.
      return false;
    }
    
    // Check all coordinates are the same.
    for(var i = 0; i < polyCoords.length; i++){
      if(Math.abs(o_coords[i][0] - polyCoords[i][0]) > 0.0001 ||
         Math.abs(o_coords[i][1] - polyCoords[i][1]) > 0.0001){
        return false;
      }
    }
    
    return true;
  };



  obj.calculatePolygonCoordinates = calculatePolygonCoordinates;
  obj.getPolygonCoordinates = function(){ return polyCoords; };
  obj.getBoundingBox = calculateBoundingBox;
  obj.collidesWith = collidesWith;
  obj.render = render;
  obj.equals = equals;

  return obj;
}