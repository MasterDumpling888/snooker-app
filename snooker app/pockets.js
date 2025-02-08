/**CLASS FOR POCKET. Contains:
 * draw pocket
 * setup pockets
 */
class Pocket {
  constructor(x, y, r) {
    const options = { //set up options for pocket
      isStatic: true,
      isSensor: true,
      friction: 0,
      label: 'Pocket'
    };

    this.x = x;
    this.y = y;
    this.r = r;

    this.body = Bodies.circle(this.x, this.y, this.r, options); //Matter body for pocket
    Matter.World.add(engine.world, this.body); //add body to Matter.World
  }

  draw() { /* draw pocket */
    push();
    noStroke();
    fill(50); //set fill to dark grey so wont be confused with black ball
    ellipse(this.body.position.x, this.body.position.y, this.r * 1.5); //though this.r = pocketSize, multiply by 1.5 to make it look better
    pop();
  }

  static setup(pocketPositions, pocketSize) { /* setup pockets */
    let pockets = [];
    for (const pocketPos of pocketPositions) {
      pockets.push(new Pocket(pocketPos.x, pocketPos.y, pocketSize));
    }
    return pockets; //return array of pockets
  }
}