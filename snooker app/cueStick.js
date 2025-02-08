/** CLASS FOR CUESTICK. Contains:
 * draw cue stick
 * adjust angle of cue stick by mouse position
 * increase force of cue stick by key press
 * decrease force of cue stick by key press
 * apply force to cue ball by key press
 */
class CueStick {
  constructor(cue) {
    this.cue = cue;

    this.length = 240; //length of cue stick
    this.angle = 0; //angle of cue stick
    this.visible = 1; //visibility of cue stick
    this.force = 0; //force of cue stick
    this.gap = -20; //gap between cue ball and cue stick
  }

  draw() { /* draw cue stick */
    //get velocity of cue ball
    const cueBallVelocity = Matter.Vector.magnitude(this.cue.body.velocity);

    //set visibility of cue stick only when the cue ball is barely moving
    this.visible = cueBallVelocity < 0.1;

    if (this.visible) { //draw cue stick only when visible
      push();
      translate(this.cue.body.position.x, this.cue.body.position.y);
      strokeWeight(8);
      stroke('SaddleBrown');
      rotate(this.angle);
      line(this.gap - this.force, 0, -this.length - this.force, 0);
      pop();
    }
  }

  adjustAngle() { /* adjust angle of cue stick by mouse position */
    let dX = mouseX - (width / 2) - this.cue.body.position.x; //get distance between mouse and cue ball
    let dY = mouseY - (height / 2) - this.cue.body.position.y; //get distance between mouse and cue ball
    this.angle = atan2(dY, dX); //get angle between mouse and cue ball
  }

  increaseForce() { /* increase force of cue stick by key press "a" */
    this.force += 7.5; //increase force of cue stick
    this.force = constrain(this.force, 0, 45); //constrain force of cue stick
    console.log(this.force); //print force of cue stick only in console
  }

  decreaseForce() { /* decrease force of cue stick by key press "s" */
    this.force -= 7.5; //decrease force of cue stick
    this.force = constrain(this.force, 0, 45); //constrain force of cue stick
    console.log(this.force); //print force of cue stick only in console
  }

  applyForce() { /* apply force to cue ball by key press "space" */
    Body.setVelocity(this.cue.body, { //set velocity of cue ball according to force and angle of cue stick
      x: this.force * cos(this.angle),
      y: this.force * sin(this.angle)
    });
    this.force = 0; //reset force of cue stick
    this.gap = -20; //reset gap of cue stick
  }
}