/* CM2023 - Graphics Programming Midterm: Snooker App 
Danica Rachel Lim */

/*----REPORT----*/
/* APP DESIGN:
 Overview:
  The snooker app is a single-player game where the player uses the mouse to position the cuestick and the “a” and “s” keys to control the force applied to the cue ball. The spacebar is used to release the cuestick and apply the force. The combination of mouse and keyboard interactions was geared towards balancing the mechanics. This allows the player to separate the handling of force and positioning for a intuitive and seamless game play.

  The app features 6 game modes, each selected by pressing the corresponding number keys:
    1. Snooker starting position
    2. Random red balls but normal starting position for coloured balls
    3. Random red and coloured balls
    4. Billiards starting position 15-balls
    5. Billiards starting position 9-balls
    6. Billiards starting position 9-balls and GOBLIN
  
  For the extension, a unique feature of the app is the sixth game mode, where the player competes against a goblin with the objective of pocketing the majority of the red balls. If the goblin collides with a red ball, the ball is removed and the goblin scores a point. If the player pockets a red ball, the ball is removed and the player scores a point.
  
  The goblin, implemented as an extension of the Ball class, moves randomly using the p5 noise function for a more natural movement. To further enhance the movement, frameCount is passed into the goblin, generating x-y coordinates that are mapped to the dimensions of the inner table and set it as the Matter body position. 

  The use of the p5 noise function, as opposed to a basic random function, was a deliberate choice to add a unique and challenging element to the game, showcasing the difference of Perlin noise from basic random values.

  The app’s design utilizes classes to create a modular and organized code structure, enhancing maintainability and readability. This allows for easier debugging, maintenance, modification, and addition of code.

  The GameSetup class, in particular, demonstrates the scalability of the structure. It stores all settings and values dependent on the table dimensions, allowing the app to scale accordingly with any adjustments to the table size. This class also minimizes the use of global variables, contributing to a more organized code structure.

*/
//Total word count: 366


// engine variables
const {
  Engine, World, Bodies,
  Body, Mouse, MouseConstraint,
  Constraint, Composites } = Matter;

let canvas;
let engine;

// class variables
let game;
let cueBall;
let cueStick;

// image variables
let baize; // surface of table

//sound variables
let fallSound;

function preload() { /* preload images and sounds */
  soundFormats('mp3'); //set sound format to mp3
  outputVolume(1); //set output volume to 1; volume of all sound output

  baize = loadImage('./assets/images/baize.jpg'); //load image for table surface 

  fallSound = loadSound('./assets/sounds/hole_fall.mp3'); //load fall sound
  fallSound.setVolume(0.5); //set volume of fall sound to 0.5
}

function setup() {
  canvas = createCanvas(1080, 720);
  rectMode(CENTER); //set rectMode to CENTER because Matter.js uses center of canvas as origin
  engine = Engine.create({ gravity: { x: 0, y: 0 } });

  //call classes for game setup
  game = GameSetup.set(720);

  // call class for ball
  cueBall = new Ball(-250, 0, game.settings);

  // handle collision on Matter bodies
  Matter.Events.on(engine, 'collisionStart', handleCollision);

  // call class for cue stick
  cueStick = new CueStick(cueBall);
}

function draw() {
  background(130); //set background color
  Engine.update(engine); //update Matter engine
  makeMenu(); //print menu on screen

  translate(width / 2, height / 2); //translate to center of canvas because Matter.js uses center of canvas as origin
  cueBall.outOfBounds(); //check if cue ball is out of bounds
  game.draw(); //call draw of GameSetup class
  cueBall.draw(); //call draw of Ball class for cue ball
  cueStick.draw(); //call draw of CueStick class
}

function makeMenu() { /* prints texts for legend, message, score, goblin score */
  push();
  fill(255);
  /* set text settings */
  textFont('Arial');
  textSize(24);
  const textSpacing = textAscent() + 5;
  const textX = 10;

  /* print texts */
  text('Press 1, 2, 3, 4, 5 ,6 for the corresponding game mode', textX, height - (textSpacing * 5));
  text('Press 0 to clear the table', textX, height - textSpacing * 4);
  text('Click mouse to release ball in "D"', textX, textSpacing);
  text('Press "a" to add force to cue stick', textX, textSpacing * 2);
  text('Press "s" to subtract force from the cue stick', textX, textSpacing * 3);
  text('Press "space" to shoot cue ball', textX, textSpacing * 4);

  /* print score*/
  let s = 'Score: ' + game.settings.score;
  const w = textWidth(s); //text width of score to print goblin score next to it

  text(s, textX, textSpacing * 5); //print score
  if (game.settings.goblin) text('Goblin Score: ' + game.settings.goblinScore, w + 50, textSpacing * 5); //print goblin score only when Goblin mode is selected

  /* print out message */
  fill(255, 150, 200);
  text(game.settings.message, textX, textSpacing * 6);
  pop();
}

function modeSelected(mode) { /*sets the game mode which player has selected*/
  if (game.gameMode.hasOwnProperty(mode)) {
    cueBall.returnToStartingPosition(); //return cue ball to starting position
    cueBall.isInPlayerHand = true; //set cue ball to be in player's hand
    game.clearTable(); //clear table first so balls don't overlap
    game.gameMode[mode](); // call game mode function
  }
}

function mouseMoved() { /* check if mouse moves */
  let mouse = createVector(mouseX - width / 2, mouseY - height / 2); //create vector for mouse position; translate to center of canvas because Matter.js uses center of canvas as origin
  cueStick.adjustAngle(); //adjust angle of cue stick according to mouse position
  cueBall.giveToPlayer(game.checkD(mouse), mouse); //give cue ball to player when mouse is in "D" if cue ball is not in player's hand
}

function mouseReleased() { /* check if mouse is released */
  let mouse = createVector(mouseX - width / 2, mouseY - height / 2); //create vector for mouse position; translate to center of canvas because Matter.js uses center of canvas as origin
  cueBall.dropBall(game.checkD(mouse)); //drop cue ball when mouse is in "D" if cue ball is in player's hand
}

function keyPressed() { /* check if key is pressed */
  if (key == 'A' || key == 'a') {
    cueStick.increaseForce(); //increase force of cue stick if key "a" is pressed
  } else if (key == 'S' || key == 's') {
    cueStick.decreaseForce(); //decrease force of cue stick if key "s" is pressed
  } else if (key == ' ') {
    //release cue stick if key "space" is pressed
    cueStick.gap = 0; //reset gap of cue stick
    cueStick.applyForce(); //apply force to cue stick if key "space" is pressed
  }

  // call modeSelected function for the corresponding key pressed
  modeSelected(key);
}

function handleCollision(event) { /* handles collision for Matter bodies. */
  for (const pair of event.pairs) { //loop through all pairs of bodies involved in collision
    cueBall.collision(pair, 'Pocket'); //check if cue ball collides with pocket handles pocketed cue ball accordingly

    // check if any ball except cue ball collides with pocket
    // check if red ball collides with goblin
    if (pair.bodyA.label === 'Pocket' && pair.bodyB.label !== 'CueBall' ||
      (pair.bodyA.label === 'Goblin' && pair.bodyB.label === 'RedBall')
    ) {
      game.collision(pair); //handles collision accordingly
    }
  }
}
