/**CLASS FOR ANY BALL OBJECT. Contains functions:
 * creates a ball with the given x and y position and game settings
 * creates a Matter.circle body with the given x and y position and game settings and adds it to Matter.World
 * draws the ball
 * checks for collision with pockets
 * checks if give to player cue ball
 * checks if should drop cue ball
 * resets a ball object to initial position
 */

class Ball {
  constructor(x, y, gameSettings) {
    const options = { //set options for ball
      friction: 0.2,
      restitution: 0.5,
      frictionAir: 0.05,
      frictionStatic: 0.3,
      label: 'CueBall',
      render: {
        fillStyle: 'Ivory'
      }
    };

    this.x = x;
    this.y = y;
    this.gameSettings = gameSettings; //get game settings object from GameSetup class

    this.body = Bodies.circle(this.x, this.y, gameSettings.ballRadius, options); //Matter body for ball

    this.isInPlayerHand = true; // boolean to check if ball is in player's hand

    World.add(engine.world, this.body); // add body to Matter.World
  }

  draw() { /* draw ball with p5 rendering */
    const pos = this.body.position;
    push();
    stroke(200); //white border to make ball more apparent
    fill(this.body.render.fillStyle); // get Matter body fillStyle
    ellipse(pos.x, pos.y, this.gameSettings.ballDiameter);
    pop();
  }

  collision(pair, ball) { /* checks for balls' collision with pockets */
    /** takes pair of Matter objects that have collided and Ball object in array if applicable */
    const bodyA = pair.bodyA;
    const bodyB = pair.bodyB;
    if (bodyA.label === 'Pocket' && bodyB.label === this.body.label) {
      fallSound.play(); // play ball falling sound
      this.pocketed(bodyB, ball); //calls the pocketed function for the corresponding ball
    }
  }

  giveToPlayer(checkD, mouse) { /* gives player th cue ball */
    /** takes GameSetup's check if mouse is in "D" function
     * and mouse position vector
     */
    if (checkD) {
      // if isInPlayerHand is true then set ball position to mouse position else set isInPlayerHand to false again 
      return this.isInPlayerHand ? Body.setPosition(this.body, mouse) : this.isInPlayerHand = false;
    }
  }

  dropBall(checkD) { /* lets player set ball in mouse's current position */
    /** takes GameSetup's check if mouse is in "D" function */
    if (checkD) {
      // if isInPlayerHand is false then set ball position to initial position else set isInPlayerHand to false to make sure player drops ball
      return !this.isInPlayerHand ? () => {
        Body.setPosition(this.body, { x: this.x, y: this.y });
        Body.setVelocity(this.body, { x: 0, y: 0 });
      } : this.isInPlayerHand = false;
    }
  }

  returnToStartingPosition() { /* resets ball to initial position */
    Body.setPosition(this.body, { x: this.x, y: this.y }); //takes current position
    Body.setVelocity(this.body, { x: 0, y: 0 }); // sets velocity to 0 so ball doesn't move
  }

  outOfBounds() { /* checks if ball is out of bounds */
    const translateOffset = this.gameSettings.translateOffset;
    const pos = this.body.position;
    if (pos.x < -translateOffset.x || pos.x > translateOffset.x || pos.y < -translateOffset.y || pos.y > translateOffset.y) {
      this.gameSettings.message = 'Alert: Cue Ball went out of bounds'; //set message
      this.returnToStartingPosition(); //return ball to starting position
    }
  }

  pocketed(body, ball) { /* handles pocketed ball */
    let balls = this.gameSettings;
    // check which ball has been pocketed and handle accordingly
    switch (body.label) {
      case 'CueBall': // if cueball is pocketed
        this.gameSettings.message = 'Foul: Cue Ball pocketed'; //set message
        this.isInPlayerHand = true; //set isInPlayerHand to true so player can pick up ball
        this.returnToStartingPosition(); //return ball to starting position in "D"
        break;
      case 'RedBall': // if red ball is pocketed
        balls.pocketedBall = ball.type; // set pocketedBall to current ball
        World.remove(engine.world, body); //remove body from Matter.World
        balls.redBalls.splice(balls.redBalls.indexOf(ball), 1); //remove ball from redBalls array
        balls.score++; //increase score by 1
        break;
      case 'Goblin': // if goblin is pocketed
        this.gameSettings.message = 'Congrats: Goblin pocketed! You win!'; //set message
        World.remove(engine.world, body); //remove body from Matter.World
        balls.goblin = null; //set goblin object to null
        break;
      case ball.colour + ' Ball': // if coloured ball is pocketed
        if (balls.redBalls.length > 0) { //check if red balls are still on table if yes then coloured ball return to intial position
          this.returnToStartingPosition(); //return ball to initial position

          if (balls.pocketedBall === 'RedBall') { //make sure red ball is pocketed first
            ball.checkColourScore(ball.colour); //check colour of ball and increase score accordingly
            balls.pocketedBall = ball.type; //set pocketedBall to current ball
          } else {
            this.gameSettings.message = 'Foul: Coloured Ball pocketed!'; //set message
          }
        } else if (balls.redBalls.length <= 0 && balls.colouredBalls.length > 0) {  //if there are no more red balls on the table then coloured balls can be pocketed
          balls.colouredBalls.splice(balls.colouredBalls.indexOf(ball), 1); //remove ball from colouredBalls array
          World.remove(engine.world, body); //remove body from Matter.World
          ball.checkColourScore(ball.colour); //check colour of ball and increase score accordingly
        }
        break;
    }
  }
}
/**CLASS FOR RED BALLS. Contains:
 * constructor that calls Ball constructor and sets label and fillStyle
 * static function to set triangle formation of red balls
 * static function to set diamond formation of red balls
 * static function to set random position of red balls
 */
class RedBall extends Ball {
  constructor(x, y, gameSettings) {
    super(x, y, gameSettings);
    this.body.label = 'RedBall'; //set label
    this.type = 'RedBall'; //set type
    this.body.render.fillStyle = 'OrangeRed'; //set colour of ball
  }

  static setTriangle(gameSettings) { /* set up RedBall Class in triangle formation.
    Has to take gameSettings separately from constructor because static function can't access this.gameSettings */
    const radius = gameSettings.ballRadius;
    const diameter = gameSettings.ballDiameter;
    const rightStartPos = gameSettings.startPos.right;
    let balls = [];

    for (let i = 0; i <= 5; ++i) {
      for (let j = 0; j < i; ++j) {
        balls.push(new RedBall(rightStartPos + (i * diameter), radius + (j * diameter) - (i * radius), gameSettings));
      }
    }
    return balls;
  }

  static setDiamond(num, gameSettings) { /* set up RedBall Class in diamond formation.
    Has to take gameSettings separately from constructor because static function can't access this.gameSettings */
    const radius = gameSettings.ballRadius;
    const diameter = gameSettings.ballDiameter;
    const rightStartPos = gameSettings.startPos.right;
    const peak = num / 3; //peak is the number of balls in widest row of diamond
    const f = peak - 1; //f is the number of balls in the first row of second half of diamond
    let balls = [];

    // set up first half of diamond
    for (let i = 0; i <= peak; ++i) {
      for (let j = 0; j < i; ++j) {
        balls.push(new RedBall(rightStartPos + (i * diameter), radius + (j * diameter) - (i * radius), gameSettings));
      }
    }

    // set up second half of diamond. Reverse triangle formation
    for (let i = f; i >= 0; --i) {
      for (let j = i; j > 0; --j) {
        balls.push(new RedBall((rightStartPos + (peak * diameter * 2)) - (i * diameter), -radius + (j * diameter) - (i * radius), gameSettings));
      }
    }
    return balls;
  }

  static setRandom(num, gameSettings) { /* set up RedBall Class in random positions.
    Has to take gameSettings separately from constructor because static function can't access this.gameSettings */
    const translateOffset = gameSettings.translateOffset;
    let balls = [];

    for (let i = 0; i < num; ++i) { //iterate over num 
      // set random position within translateOffset
      let randomX = random(-translateOffset.x, translateOffset.x);
      let randomY = random(-translateOffset.y, translateOffset.y);
      balls.push(new RedBall(randomX, randomY, gameSettings)); //create new RedBall object and push to balls array
    }
    return balls;
  }
}

/** CLASS FOR COLOURED BALLS. Contains:
 * constructor that calls Ball constructor and sets label and fillStyle
 * static function to set coloured balls to initial positions
 * static function to set coloured balls to random positions
 * function to check colour of ball and increase score accordingly
 */
class ColouredBall extends Ball {
  constructor(x, y, gameSettings, colour) {
    super(x, y, gameSettings);
    this.colour = colour; //get colour of ball 
    this.body.label = colour + ' Ball'; //set label
    this.type = 'ColouredBall'; //set type
    this.body.render.fillStyle = colour; //set colour of ball
  }

  static setBalls(values, gameSettings) { /* set up ColouredBall Class. 
    Has to take gameSettings separately from constructor because static function can't access this.gameSettings.
    "values" is an array positions to set starting position */
    let balls = [];

    for (const value of values) { //iterate over values array
      balls.push(new ColouredBall(value.x, value.y, gameSettings, value.color)); //create new ColouredBall object and push to balls array
    }
    return balls;
  }

  static setRandom(values, gameSettings) { /* set up ColouredBall Class. 
    Has to take gameSettings separately from constructor because static function can't access this.gameSettings. */
    const translateOffset = gameSettings.translateOffset;
    let balls = [];

    for (const value of values) { //iterate over values array
      // set random position within translateOffset
      let randomX = random(-translateOffset.x, translateOffset.x);
      let randomY = random(-translateOffset.y, translateOffset.y);
      balls.push(new ColouredBall(randomX, randomY, gameSettings, value.color)); //create new ColouredBall object and push to balls array
    }
    return balls;
  }

  checkColourScore(colour) { /* check colour of ball and increase score accordingly */
    switch (colour) {
      case 'Yellow':
        this.gameSettings.score += 2;
        break;
      case 'Green':
        this.gameSettings.score += 3;
        break;
      case 'Brown':
        this.gameSettings.score += 4;
        break;
      case 'Blue':
        this.gameSettings.score += 5;
        break;
      case 'Pink':
        this.gameSettings.score += 6;
        break;
      case 'Black':
        this.gameSettings.score += 7;
        break;
    }
  }
}

/** CLASS FOR GOBLIN. Contains:
 * constructor that calls Ball constructor and sets label and fillStyle
 * static function to set goblin to initial position
 * function to move goblin
 * function to check if goblin has eaten/collided with red ball
*/
class Goblin extends Ball {
  constructor(x, y, gameSettings) {
    super(x, y, gameSettings);
    this.body.label = 'Goblin'; //set label
    this.body.render.fillStyle = 'Lime'; //set colour of ball
  }

  static setBall(value, gameSettings) { /* set up Goblin Class. Has to take gameSettings separately from constructor because static function can't access this.gameSettings */
    return new Goblin(value.x, value.y, gameSettings);
  }

  move() { /* move goblin randomly. Used noise function for smoother movement */
    const translateOffset = this.gameSettings.translateOffset;
    let noisePos = { x: noise(frameCount * 0.01), y: noise(frameCount * 0.03) }; //used framecount to make noise function more dynamic
    let pos = { //map noise function to translateOffset so that goblin moves within the table
      x: map(noisePos.x, 0, 1, -translateOffset.x, translateOffset.x),
      y: map(noisePos.y, 0, 1, -translateOffset.y, translateOffset.y)
    };
    Body.setPosition(this.body, pos);
  }

  eatRed(body, ball) { /* check if goblin has eaten red ball */
    if (body.label === 'RedBall') { //check if body is red ball
      World.remove(engine.world, body); //remove red ball from Matter.World
      this.gameSettings.redBalls.splice(this.gameSettings.redBalls.indexOf(ball), 1); //remove red ball from redBalls array
      this.gameSettings.goblinScore++; //increase goblin score by 1
      if (this.gameSettings.redBalls.length <= 0) { //check if there are no more red balls on the table
        this.gameSettings.message = 'Goblin ate all the red balls! You lose!'; //set message
      }
    }
  }
}