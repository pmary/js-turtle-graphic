class Turtle {
  constructor(canvas, arrowCanvas) {
    this.ctx = canvas.getContext("2d");
    this.arrowCtx = arrowCanvas.getContext("2d");
    this.width = canvas.width;
    this.height = canvas.height;
    this.pos = {
      x: Math.floor(this.width / 2) + .5,
      y: Math.floor(this.height / 2) + .5
    }
    // The direction of the head of the turtle
    this.heading = 0;
    this.penDown = true;
    this.arrowAngle = Math.PI;

    // The incremental points along the path to draw
    this.points = [];

    // variable to hold how many frames have elapsed in the animation
    // t represents each waypoint along the path and is incremented in the animation loop
    this.t = 1;

    this.vertices = [{x: this.pos.x, y: this.pos.y, heading: this.heading}];

    this.timerId;
    this.lastTime = 0;
  }

  requestAnimationFrame(callback, element) {
    var currTime = new Date().getTime();
    var timeToCall = Math.max(0, 0.1 - (currTime - this.lastTime));
    this.timerId = window.setTimeout(function () {
      callback(currTime + timeToCall);
    },
    timeToCall);
    this.lastTime = currTime + timeToCall;
    return this.timerId;
  };

  cancelAnimationFrame() {
    clearTimeout(this.timerId);
  };

  /**
   * calc waypoints traveling along vertices
   */
  calcWaypoints() {
    var waypoints=[];
    for(var i = 1; i < this.vertices.length; i++){
        var pt0 = this.vertices[i-1];
        var pt1 = this.vertices[i];
        var dx = pt1.x - pt0.x;
        var dy = pt1.y - pt0.y;
        for(var j = 0; j < 100; j++){
            var x = pt0.x + dx * j / 100;
            var y = pt0.y + dy * j / 100;
            waypoints.push({x: x, y: y, arrowAngle: this.vertices[i].arrowAngle});
        }
    }
    return(waypoints);
  }

  /**
   * Use the calculated waypoints to draw the necessary lines and animate the
   * drawing
   */
  animate() {
    if (this.t < this.points.length - 1) {
      this.requestAnimationFrame(this.animate.bind(this));
    }

    // draw a line segment from the last waypoint
    // to the current waypoint
    this.ctx.beginPath();
    this.ctx.moveTo(this.points[this.t-1].x, this.points[this.t-1].y);
    this.ctx.lineTo(this.points[this.t].x, this.points[this.t].y);
    this.ctx.stroke();
    this.ctx.save();
    // increment "t" to get the next waypoint

    // Draw the arrow
    this.arrowCtx.clearRect(0, 0, this.width, this.height);
    this.arrowCtx.save();
    var size = 6;

    this.arrowCtx.beginPath();
    this.arrowCtx.translate(this.points[this.t-1].x, this.points[this.t-1].y);
    this.arrowCtx.rotate(this.points[this.t-1].arrowAngle);
    this.arrowCtx.fillStyle = '#000';
    this.arrowCtx.lineWidth = 0;
    this.arrowCtx.moveTo(0, -size);
    this.arrowCtx.lineTo(-size, -size);
    this.arrowCtx.lineTo(0, 0);
    this.arrowCtx.lineTo(size, -size);
    this.arrowCtx.lineTo(0, -size);
    this.arrowCtx.closePath();
    this.arrowCtx.fill();
    this.arrowCtx.restore();

    this.t++;
  }

  /**
   * Calculate the waypoints following the steps given and start the drawing
   * animation
   */
  draw() {
    // calculate incremental points along the path
    this.points = this.calcWaypoints();

    // start the animation
    this.animate();
  }

  /**
   * Move forward
   * @param {Number} amount
   */
  forward(amount) {
    this.pos.x += Math.sin(this.heading) * -amount;
    this.pos.y += Math.cos(this.heading) * -amount;

    this.vertices.push({x: this.pos.x, y: this.pos.y, arrowAngle: this.arrowAngle});
	};

  /**
   * Move backward
   * @param {Number} amount
   */
  backward(amount) {
    this.forward(-amount);
	};

  /**
   * Turn right at a number degrees
   * @param {Number} deg
   */
  right(deg) {
		var delta = deg * (Math.PI/180);
    this.arrowAngle += delta;
		this.heading -= delta;
	};

  /**
   * Turn left at a number degrees
   * @param {Number} deg
   */
  left(deg) {
    this.right(-deg);
  }
}
