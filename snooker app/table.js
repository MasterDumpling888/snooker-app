/** reference:
 * https://editor.p5js.org/codingtrain/sketches/UOR4nIcNS
 * https://thecodingtrain.com/tracks/physics-libraries/138-angry-birds-with-matterjs
 * https://codepen.io/colaru/pen/xxxqPNV?editors=1010
*/
/** CLASS FOR TABLE. Contains:
 * values to position cushions, borders, pockets
 * set ups for Cushion and Pockets classes
 * draw table surface
 * draw borders
 */
class Table {
  constructor(x, y, w, h, gameSettings) {

    //offset to compensate for centering of rectMode(CENTER) and accounts for borders
    const cushionOffset = gameSettings.borderLength / 2 + gameSettings.borderWeight;

    /* create array of cushion positions and angles */
    this.cushionValues = [
      { ang: HALF_PI, pos: { x: -gameSettings.translateOffset.x, y: 0 } },
      { ang: -HALF_PI, pos: { x: gameSettings.translateOffset.x, y: 0 } },
      { ang: 0, pos: { x: gameSettings.translateOffset.x - cushionOffset, y: gameSettings.translateOffset.y } },
      { ang: 0, pos: { x: -gameSettings.translateOffset.x + cushionOffset, y: gameSettings.translateOffset.y } },
      { ang: PI, pos: { x: -gameSettings.translateOffset.x + cushionOffset, y: -gameSettings.translateOffset.y } },
      { ang: PI, pos: { x: gameSettings.translateOffset.x - cushionOffset, y: -gameSettings.translateOffset.y } }
    ];

    /* create array of border positions and angles */
    this.borderValues = [
      { ang: HALF_PI, pos: { x: -w / 2, y: 0 } },
      { ang: -HALF_PI, pos: { x: w / 2, y: 0 } },
      { ang: 0, pos: { x: gameSettings.translateOffset.x - cushionOffset, y: h / 2 } },
      { ang: 0, pos: { x: -gameSettings.translateOffset.x + cushionOffset, y: h / 2 } },
      { ang: PI, pos: { x: -gameSettings.translateOffset.x + cushionOffset, y: -h / 2 } },
      { ang: PI, pos: { x: gameSettings.translateOffset.x - cushionOffset, y: -h / 2 } }
    ];

    /* create array of pocket positions */
    this.pocketPositions = [
      { x: -gameSettings.translateOffset.x, y: -gameSettings.translateOffset.y },
      { x: 0, y: -gameSettings.translateOffset.y },
      { x: gameSettings.translateOffset.x, y: -gameSettings.translateOffset.y },
      { x: -gameSettings.translateOffset.x, y: gameSettings.translateOffset.y },
      { x: 0, y: gameSettings.translateOffset.y },
      { x: gameSettings.translateOffset.x, y: gameSettings.translateOffset.y }
    ];

    //gets array of cushion objects
    this.cushions = Cushion.setup(this.cushionValues, gameSettings.borderLength, gameSettings.borderWeight);

    //gets array of pocket objects
    this.pockets = Pocket.setup(this.pocketPositions, gameSettings.pocketSize);

    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.gameSettings = gameSettings; //get game settings object from GameSetup class
  }

  draw() { /* draw complete table */
    this.drawSurface(); // draw Surface landscape orientation

    // draw cushions
    for (let cushion of this.cushions) {
      cushion.draw();
    }

    // draw borders
    for (let i = 0; i < 6; ++i) {
      this.drawBorders(this.borderValues[i].pos, this.borderValues[i].ang);
    }

    // draw pockets
    for (let pocket of this.pockets) {
      pocket.draw();
    }
  }

  drawSurface() { /* draw table surface*/
    push();
    imageMode(CENTER); // set center image
    image(baize, 0, 0, this.w, this.h); //draw surface with image of baize

    //draw gold edges
    noFill(); // set noFill for rect so it just cover the image
    stroke(255, 215, 0); // make borders gold
    strokeWeight(this.gameSettings.borderWeight);
    rect(0, 0, this.w, this.h, 5); // draws stroke to overlay on table so can chamfer corners

    //draw starting line; "D"
    stroke(255);
    strokeWeight(1);
    line(this.gameSettings.startPos.left, -this.h / 2, this.gameSettings.startPos.left, this.h / 2);
    arc(this.gameSettings.startPos.left, 0, this.gameSettings.arcDRadius, this.gameSettings.arcDRadius, HALF_PI, -HALF_PI);
    pop();
  }

  drawBorders(pos, ang) { /* draw borders (brown) */
    push();
    noStroke();
    translate(pos.x, pos.y); // translate to position of border
    rotate(ang); // rotate to angle of border
    fill(74, 33, 6); // fill brown
    rect(0, 0, this.gameSettings.borderLength, this.gameSettings.borderWeight);
    pop();
  }
}