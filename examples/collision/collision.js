// # Quintus SAT Collision detection example
//
// [Run the example](../examples/collision/index.html)
//
// This example creates a number of random convex shapes to
// exercise the SAT-based (Separating-axis-theorem) collision 
// detection. The Shapes also rotate at different speeds and scale
// themselves up and down.
//
// Most of the code isn't particularly interesting, the main piece
// of Quintus-specific collision stuff is tucked away at the bottom of 
// the step method:
//
//     var maxCol = 3, collided = false;
//     p.hit = false;
//     while((collided = this.parent.search(this)) && maxCol > 0) {
//       if(collided) {
//         p.hit = true;
//         this.p.x -= collided.separate[0];
//         this.p.y -= collided.separate[1];
//       }
//       maxCol--;
//     }
// 
// This code actually runs detection for the object and moves it away
// from any collisions. There's a loop in there so that the object will
// move away from up to 3 collisions per frame. 
//
// The search method simply returns the first collision it hits, whether
// it be in the collision layer or with another sprite. This method is called 
// on the `parent` stage object. You can also call the collide method which is
// used primarily to trigger `hit` callbacks in lieu of returning the collision.
//
// Most of the time you won't need to worry about this directly as adding
// the `2d` component to your class will handle it for you automatically.
window.addEventListener('load',function(e) {


  // Set up a standard Quintus instance with only the 
  // Sprites and Scene module (for the stage support) loaded.
  var Q = Quintus().include("Sprites, Scenes")
                   .setup({ width: 960, height: 512 });

  // Sprite class for the randomly generated pulsating / rotating shape
  Q.Sprite.extend("RandomShape", {
     init: function(p) {
        var angle = Math.random()*2*Math.PI,
            numPoints = 3 + Math.floor(Math.random()*5),
            minX = 0, maxX = 0,
            minY = 0, maxY = 0,
            curX, curY;

        p = p || {};

        p.points = [];

        var startAmount = 40;

        for(var i = 0;i < numPoints;i++) {
          curX = Math.floor(Math.cos(angle)*startAmount);
          curY = Math.floor(Math.sin(angle)*startAmount);

          if(curX < minX) minX = curX;
          if(curX > maxX) maxX = curX;

          if(curY < minY) minY = curY;
          if(curY > maxY) maxY = curY;

          p.points.push([curX,curY]);

          startAmount += Math.floor(Math.random()*10);
          angle += (Math.PI * 2) / (numPoints+1);
        };

        maxX += 30;
        minX -= 30;
        maxY += 30;
        minY -= 30;

        p.w = maxX - minX;
        p.h = maxY - minY;

        for(var i = 0;i < numPoints;i++) {
          p.points[i][0] -= minX + p.w/2;
          p.points[i][1] -= minY + p.h/2;
        }


        p.x = Math.random()*Q.width;
        p.y = Math.random()*Q.height;
        p.cx = p.w/2;
        p.cy = p.h/2;
        p.type = 1;

        p.dx = 1;
        p.dy = 1;
        p.speed = Math.random() * 20 + 30;
        p.omega = Math.random() * 40 - 20;
        p.scaleOffset = 0;
        p.scaleSpeed = Math.random();
        p.scaleAmount = 0.70 * Math.random();

        this._super(p);
     },

    step: function(dt) {
      var p = this.p;

      p.x += p.dx * p.speed * dt;
      p.y += p.dy * p.speed * dt;

      if(p.x < 0) { 
        p.x = 0;
        p.dx = 1;
      } else if(p.x > Q.width - p.w) { 
        p.dx = -1;
        p.x = Q.width - p.w;
      }

      if(p.y < 0) {
        p.y = 0;
        p.dy = 1;
      } else if(p.y > Q.height - p.h) {
        p.dy = -1;
        p.y = Q.height - p.h;
      }

      p.angle += dt * p.omega; 

      p.scaleOffset += dt;
      p.scale = 1 + Math.sin(p.scaleOffset * p.scaleSpeed) * p.scaleAmount;


      var maxCol = 3, collided = false;
      p.hit = false;
      while((collided = this.parent.search(this)) && maxCol > 0) {

        if(collided) {
          p.hit = true;
          this.p.x -= collided.separate[0];
          this.p.y -= collided.separate[1];
        }
        maxCol--;
      }
    },

    draw: function(ctx) {
      var p = this.p;

      ctx.save();
      ctx.translate(this.p.x + this.p.cx, this.p.y + this.p.cy);

      ctx.rotate(this.p.angle * Math.PI / 180);
      ctx.scale(this.p.scale,this.p.scale);

      ctx.beginPath();
      ctx.fillStyle = this.p.hit ? "blue" : "red";
      ctx.strokeStyle = "black";

      ctx.moveTo(this.p.points[0][0],this.p.points[0][1]);
      for(var i=0;i<this.p.points.length;i++) {
        ctx.lineTo(this.p.points[i][0],this.p.points[i][1]);
      }
      ctx.lineTo(this.p.points[0][0],this.p.points[0][1]);
      ctx.stroke();
      ctx.fill();

      ctx.restore();

      ctx.strokeStyle = "gray";
      ctx.beginPath();
      ctx.moveTo(p.x,p.y);
      ctx.lineTo(p.x+p.w,p.y);
      ctx.lineTo(p.x+p.w,p.y+p.h);
      ctx.lineTo(p.x,p.y+p.h);
      ctx.lineTo(p.x,p.y);
      ctx.stroke();
    }
  });

  var numShapes = 5;

  Q.scene("start",new Q.Scene(function(stage) {
      while(numShapes-- > 0) {
        stage.insert(new Q.RandomShape());
      }
  }));

  Q.stageScene("start");


});