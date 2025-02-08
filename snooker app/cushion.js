/** CLASS FOR CUSHIONS. Contains:
 * draw cushion
 * setup cushions
*/
class Cushion {
  constructor(x, y, w, h) {
    const options = { //set up options for cushion
      isStatic: true,
      restitution: 0.75,
      label: 'Cushion'
    };

    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.trap = Bodies.trapezoid(this.x, this.y, this.w, this.h, 0.095, options); //Matter body for cushion
    World.add(engine.world, this.trap); //add body to Matter.World
  }

  draw() { /* draw cushion */
    push();
    noStroke();
    fill(0, 130, 75); // color: dark green

    //draw vertices of trapezoid
    beginShape();
    for (var i = 0; i < this.trap.vertices.length; i++) {
      vertex(this.trap.vertices[i].x, this.trap.vertices[i].y);
    }
    endShape(CLOSE);
    pop();
  }

  static setup(cushionValues, borderLength, borderWeight) { /* setup cushions */
    let cushions = [];
    for (let i = 0; i < cushionValues.length; ++i) {
      cushions.push(new Cushion(0, 0, borderLength, borderWeight));

      let trap = cushions[i].trap;
      Body.setAngle(trap, cushionValues[i].ang); //set angle of cushion
      Body.setPosition(trap, cushionValues[i].pos); //set position of cushion
    }
    return cushions; //return array of cushions
  }
}