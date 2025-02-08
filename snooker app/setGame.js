/**  CLASS THAT SETS UP THE GAME. Contains:
 * all settings for game such as variables for ball radius, border weight, pocket size, etc.
 * table setup: call the class of the table to set up the table
 * game mode setup: (this will call the class of the balls to set up the balls via static functions within each ball class)
    * 1: set up coloured balls and red balls in traditional snooker starting positions
    * 2: set up coloured balls in starting positions and red balls in random positions
    * 3: set up coloured balls and red balls in random positions
    * 4: set up red balls in triangle formation for billiards (American snooker) 15-balls positions
    * 5: set up red balls in diamond formation for billiards (American snooker) 9-balls positions
    * 6: set up red balls in diamond formation for billiards (American snooker) 9-balls positions and add goblin.
  * draws the table and balls
  * checks if mouse is within the D
  * handles collision detection for the balls
 */

class GameSetup {
  constructor(tableW) {
    this.tableW = tableW; //table width
    this.tableL = this.tableW / 2; //table length

    // declare a table variable to be initialised in the set() method with Table class
    this.table;

    /* settings object for game. can be passed to other object classes to use values*/
    this.settings = { //fill with values that are dependent on table width and length
      ballRadius: this.tableW / 72,
      borderWeight: 10,
      startPos: {
        right: this.tableW / 6,
        left: -this.tableW / 3.5
      },
      arcDRadius: this.tableL / 3,
    };

    /** set values that are dependent on the settings object properties
     * cannot be called within the settings object because object properties cannot be called within said object
     */
    this.settings.ballDiameter = this.settings.ballRadius * 2;
    this.settings.pocketSize = this.settings.ballRadius * 1.5;
    this.settings.GAP = this.tableW / 4 + this.settings.pocketSize / 3; // help position borders according to pocket sizes
    this.settings.borderLength = this.tableW / 2 - this.settings.GAP / 6; // length of borders
    this.settings.translateOffset = { //offset to compensate for centering translate and accounts for borders; gets inner table dimensions
      x: this.tableW / 2 - this.settings.borderWeight,
      y: this.tableL / 2 - this.settings.borderWeight
    };

    /** declare arrays for balls to be initialised and populated in the gameMode
     * will be populated according to the current active game mode
    */
    this.settings.redBalls = []; // array to store red balls
    this.settings.colouredBalls = []; // array to store coloured balls
    this.settings.goblin;

    this.settings.pocketedBall = null; // variable to store latest ball pocketed
    this.settings.message = '';
    this.settings.score = 0;
    this.settings.goblinScore = 0;

    let settings = this.settings;

    /** array of coloured balls starting positions and corresponding colours 
     * can't use "this." because it cannot be iterated over when called within the class
    */
    const colourBallValues = [
      { x: settings.startPos.left, y: -settings.arcDRadius + settings.GAP, color: 'Yellow' },
      { x: settings.startPos.left, y: settings.arcDRadius - settings.GAP, color: 'Green' },
      { x: settings.startPos.left, y: 0, color: 'Brown' },
      { x: 0, y: 0, color: 'Blue' },
      { x: settings.startPos.right, y: 0, color: 'Pink' },
      { x: settings.startPos.right + settings.GAP, y: 0, color: 'Black' }
    ];

    // game mode object that will be called to set up the balls and position them according to the mode
    this.gameMode = {
      '0': () => { // clear table}
        this.clearTable();
      },
      '1': () => { // snooker starting position
        settings.colouredBalls = ColouredBall.setBalls(colourBallValues, settings);
        settings.redBalls = RedBall.setTriangle(settings);
      },
      '2': () => { // random red balls but normal starting position for coloured balls
        settings.colouredBalls = ColouredBall.setBalls(colourBallValues, settings);
        settings.redBalls = RedBall.setRandom(15, settings);
      },
      '3': () => { // random red and coloured balls
        settings.colouredBalls = ColouredBall.setRandom(colourBallValues, settings);
        settings.redBalls = RedBall.setRandom(15, settings);
      },
      '4': () => { // billiards starting position 15-balls
        settings.redBalls = RedBall.setTriangle(settings);
      },
      '5': () => { // billiards starting position 9-balls
        settings.redBalls = RedBall.setDiamond(9, settings);
      },
      '6': () => { // billiards starting position 9-balls and goblin
        settings.goblin = Goblin.setBall({ x: 0, y: 0 }, settings);
        settings.redBalls = RedBall.setDiamond(9, settings);
      }
    }
  }

  static set(tableWidth) { //static method to set up game class
    let game = new GameSetup(tableWidth);
    // initialise table with Table class
    game.table = new Table(0, 0, game.tableW, game.tableL, game.settings);
    // set the default game setup to mode 1
    game.gameMode[1]();
    return game;
  }

  checkD(target) {
    // checks if mouse is within the D
    const dPos = createVector(this.settings.startPos.left, this.settings.tableLength / 2 - this.settings.borderWeight - this.settings.GAP)
    //check if mouse is left-side of line; compensate for diameter of coloured ball so cue can't touch it
    if (target.x <= this.settings.startPos.left - this.settings.ballDiameter) {
      if (dist(target.x, target.y, dPos.x, dPos.y) < this.settings.arcDRadius / 2) { //check if mouse is near arc
        return true;
      }
    }
    return false;
  };

  draw() { // draw table and balls
    let settings = this.settings;
    this.table.draw();

    // draw red balls
    for (const redBall of settings.redBalls) {
      redBall.draw();
    }

    // draw coloured balls
    for (const colouredBall of settings.colouredBalls) {
      colouredBall.draw();
    }

    if (settings.goblin) { // check if goblin exists first then draw else don't draw
      settings.goblin.draw();
      settings.goblin.move();
    }
  }

  clearTable() { // clear everything from table
    this.settings.message = ''; // clear message
    this.settings.score = 0; // reset score
    this.settings.goblinScore = 0; // reset goblin score
    let balls = this.settings;

    for (let rBall of balls.redBalls) { // remove all balls from world
      World.remove(engine.world, rBall.body);
    }

    for (let cBall of balls.colouredBalls) { // remove all balls from world
      World.remove(engine.world, cBall.body);
    }
    // reset arrays
    balls.colouredBalls = [];
    balls.redBalls = [];

    // remove goblin if it exists
    if (balls.goblin) {
      World.remove(engine.world, balls.goblin.body);
      balls.goblin = null;
    }
  }

  collision(pair) { // handles collision detection for the balls except cue ball
    const bodyA = pair.bodyA;
    const bodyB = pair.bodyB;

    // matches the bodyB to the corresponding ball object; used to call the ball's collision method
    const colouredBall = this.settings.colouredBalls.find(ball => ball.body.id === bodyB.id);
    const redBall = this.settings.redBalls.find(ball => ball.body.id === bodyB.id);

    const goblin = this.settings.goblin;

    if (bodyA.label === 'Goblin' && bodyB.label === 'RedBall') { // check if goblin is colliding with red ball
      fallSound.play();
      goblin.eatRed(bodyB, redBall);
    }

    // collision handling for balls in pockets
    if (bodyB.label === 'RedBall') {  // check if bodyB is a red ball
      fallSound.play();
      redBall.collision(pair, redBall);
    } else if (bodyB.label === colouredBall.colour + ' Ball') { // check if bodyB is a coloured ball
      fallSound.play();
      colouredBall.collision(pair, colouredBall);
    } else if (bodyB.label === 'Goblin') { // check if bodyB is goblin
      fallSound.play();
      goblin.collision(pair, goblin);
    }
  }
}
