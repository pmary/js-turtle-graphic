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

    // Animation variables
    this.timerId;
    this.startTime = null;
    this.time;

    this.isFilling = false;
  }

  requestAnimationFrame(callback, element) {
    var currTime = new Date().getTime();
    var timeToCall = Math.max(0, 1 - (currTime - this.lastTime));
    var timerId = window.setTimeout(function () {
      callback(currTime + timeToCall);
    },
    timeToCall);
    this.lastTime = currTime + timeToCall;
    return timerId;
  };

  cancelAnimationFrame(timerId) {
    clearTimeout(timerId);
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
        for(var j = 0; j < 20; j++){
            var x = pt0.x + dx * j / 20;
            var y = pt0.y + dy * j / 20;
            waypoints.push({
              x: x,
              y: y,
              arrowAngle: this.vertices[i].arrowAngle,
              action: this.vertices[i].action
            });
        }
    }
    return(waypoints);
  }

  /**
   * Use the calculated waypoints to draw the necessary lines and animate the
   * drawing
   */
  animate() {
    this.time = new Date().getTime(); //millisecond-timstamp
    if (this.startTime === null) {
      this.startTime = this.time;
    }
    var progress = this.time - this.startTime;
    var timerId;
    if (progress < 500) {
      timerId = this.requestAnimationFrame(this.animate.bind(this));
    }
    else {
      cancelAnimationFrame(timerId);
      if (this.points[this.t]) {
        timerId = this.requestAnimationFrame(this.animate.bind(this));
      }
    }

    if (this.points[this.t-1] && this.points[this.t]) {
      switch (this.points[this.t-1].action) {
        case 'goto':
          this.ctx.beginPath();
          this.ctx.moveTo(this.points[this.t-1].x, this.points[this.t-1].y);
          this.ctx.lineTo(this.points[this.t].x, this.points[this.t].y);
        break;

        case 'beginFill':
          this.isFilling = true;
          this.ctx.beginPath();
        break;

        case 'endFill':
          //console.log('endFill');
          this.isFilling = false;
          this.ctx.closePath();
          this.ctx.fillStyle = "#000";
          this.ctx.fill();
          this.ctx.stroke();
        break;

        case 'forward':
          // draw a line segment from the last waypoint
          // to the current waypoint
          if (!this.isFilling) {
            this.ctx.beginPath();
            this.ctx.moveTo(this.points[this.t-1].x, this.points[this.t-1].y);
          }
          this.ctx.lineTo(this.points[this.t].x, this.points[this.t].y);
          this.ctx.stroke();
          if (!this.isFilling) {
            this.ctx.save();
          }
        break;

        default:

      }

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

      // increment "t" to get the next waypoint
      this.t++;
    }
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
   * Set the heading
   * @param {Number} deg
   */
  setHeading(deg) {
    var delta = deg * (Math.PI/180);
    this.arrowAngle = delta;
		this.heading = delta;
  }

  /**
   * Move turtle to an absolute position. If the pen is down, draw line.
   * Do not change the turtle’s orientation.
   */
  goto(x, y) {
    this.pos.x = x;
    this.pos.y = y;

    this.vertices.push({
      x: this.pos.x,
      y: this.pos.y,
      arrowAngle: this.arrowAngle,
      action: 'goto'
    });
  }

  beginFill() {
    this.vertices.push({
      x: this.pos.x,
      y: this.pos.y,
      arrowAngle: this.arrowAngle,
      action: 'beginFill'
    });
  }

  endFill() {
    this.vertices.push({
      x: this.pos.x,
      y: this.pos.y,
      arrowAngle: this.arrowAngle,
      action: 'endFill'
    });
  }

  /**
   * Pen up
   */
  up() {
    this.penDown = false;
  }

  /**
   * Pen down
   */
  down() {
    this.penDown = true;
  }

  /**
   * Move forward
   * @param {Number} amount
   */
  forward(amount) {
    this.pos.x += Math.sin(this.heading) * -amount;
    this.pos.y += Math.cos(this.heading) * -amount;

    this.vertices.push({
      x: this.pos.x,
      y: this.pos.y,
      arrowAngle: this.arrowAngle,
      action: 'forward'
    });
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
