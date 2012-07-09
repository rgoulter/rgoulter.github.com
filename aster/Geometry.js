/*
Helper methods for Geometry and collision detection.
*/
var Geometry = (function(){
	var g = {};



	// rotates point p (in format [x, y]) counterclockwise by angle.
	// does not mutate point.
	var rotatePoint = function(p, angle){
		var x = p[0], y = p[1];
		var q = [x, y];
		
		/*
		 To rotate x, y by A,
		 x' = x*cos(A) - y*sin(A)
		 y' = x*sin(A) + y*cos(A)
		*/
		var c = Math.cos(angle);
		var s = Math.sin(-angle);
		q[0] = x * c - y * s; // x'
		q[1] = x * s + y * c; // y'
		
		return q;
	};



	// translates point p by dx and dy.
	// does not mutate point.
	var translatePoint = function(p, dx, dy){
	  return [p[0] + dx, p[1] + dy];
	};



	/*
	 Determines whether p3 lies to the left (ccw) of line p1, p2.
	 Each point (p1, p2, p3) is an array [x, y].
	 
	 Returns > 0 if p3 lies to the left,
			 = 0 if p3 is colinear,
			 < 0 if p3 lies to the right.
	*/
	var ccw = function(p1, p2, p3){
	  return (p2[0] - p1[0]) * (p3[1] - p1[1]) - (p2[1] - p1[1]) * (p3[0] - p1[0]);
	};



	/*
	 Determines whether two finite length lines intersect.
	 Each line is an array of points, [p1, p2].
	 
	 Returns true if they intersect, false otherwise.
	*/
	var linesIntersect = function(l1, l2){
	  var p1 = l1[0], p2 = l1[1];
	  var p3 = l2[0], p4 = l2[1];
	  return ccw(p1, p2, p3) * ccw(p1, p2, p4) <= 0 &&
			 ccw(p3, p4, p1) * ccw(p3, p4, p2) <= 0;
	};



	/*
	 Determines whether two polygons intersect.
	 Brute algorithm, determine whether any lines intersect.
	 
	 Each polygon is expected to be an array of points. Polygons are
	 assumed to not self-intersect.
	 
	 Time complexity O(mn), for number of vertices m and n.
	*/
	var polygonsIntersect = function(poly1, poly2){
	  var n = poly1.length;
	  for(var i = 0; i < poly1.length; i++){
		var line1 = [poly1[i], poly1[(i + 1) % n]];
		
		if(linePolygonIntersect(line1, poly2)){
		  return true;
		}
	  }
	  
	  return false;
	};



	var linePolygonIntersect = function(line, poly){
	  var n = poly.length;
	  for(var i = 0; i < poly.length; i++){
		line2 = [poly[i], poly[(i + 1) % n]];
		
		if(linesIntersect(line, line2)){
		  return true;
		}
	  }
	  
	  return false;
	}



	g.rotatePoint = rotatePoint;
	g.translatePoint = translatePoint;
	g.ccw = ccw;
	g.linesIntersect = linesIntersect;
	g.linePolygonIntersect = linePolygonIntersect;
	g.polygonsIntersect = polygonsIntersect;

	return g;
}());