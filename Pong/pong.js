/* eslint-disable */

class Vector2 {
  constructor(x=0, y=0){
    this.x = x
    this.y = y
  }

  get normalizedSpeed(){
    return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2))
  }

  set normalizedSpeed(val) {
    const factor = val / this.normalizedSpeed
    this.x *= factor
    this.y *= factor
  }
}
class Shape {
  constructor(width, height, color='white'){
    this.position = new Vector2
    this.size = new Vector2(width, height)
    this.color = color
  }
  get top(){
    return this.position.y - this.size.y / 2
  }
  get bottom(){
    return this.position.y + this.size.y / 2
  }
  get left(){
    return this.position.x - this.size.x / 2
  }
  get right(){
    return this.position.x + this.size.x / 2
  }
}

class Rectangle extends Shape {
  constructor(width, height, color='white'){
    super(width, height, color)
  }
  draw(ctx){
    ctx.fillStyle = this.color
    ctx.fillRect(this.left, this.top, this.size.x, this.size.y)
    
  }
}

class Circle extends Shape {
  constructor(width, height, color){
    super(width, height, color)
  }
  draw(ctx){
    ctx.fillStyle = this.color
    ctx.beginPath()

    ctx.arc(this.position.x, this.position.y, this.size.x/2, 0, Math.PI * 2, true)
    ctx.fill()
  }
}

class Ball extends Circle {
  constructor(radius=5, color){
    super(radius*2, radius*2, color)

    this.velocity = new Vector2
    this.color = color
  }
}

class Player extends Rectangle {
  constructor(){
    super(10, 100)
    this.score = 0
  }
  checkCollision(object) {
    if(this.left < object.right &&
       this.right > object.left &&
       this.top < object.bottom &&
       this.bottom > object.top){
         object.velocity.x = -object.velocity.x
         const normalizedSpeed = object.velocity.normalizedSpeed
         object.velocity.y += 300 * (Math.random() - 0.4)
         object.velocity.normalizedSpeed = normalizedSpeed * 1.05
       }
  }
}

class PongGame {
  constructor(canvas, options={}){
    this._canvas = canvas
    this._canvasContext = canvas.getContext('2d')

    this.ball = new Ball(5, 'red');
    
    this.winCount = options.winCount ? options.winCount : 10

    this.players = [
      new Player,
      new Player
    ]

    this.players[0].position.x = this.players[0].size.x
    this.players[1].position.x = this._canvas.width - this.players[0].size.x
    this.players.forEach(player => {
      // start each player paddle vertically centered
      player.position.y = this._canvas.height / 2
    })

    this.activeGame = false;

    // AI PLAYER ON BY DEFAULT
    this.aiPlayer = options.aiIsOn ? options.aiIsOn : true

    let lastTimeEntered;
    const callback = (ms) => {
      if(lastTimeEntered){
        // check run time and convert to seconds
        this.update((ms - lastTimeEntered) / 1000)
      }
      lastTimeEntered = ms
      // start animation recursion
      requestAnimationFrame(callback)
    }
    callback()

    // Setup input handlers
    this._canvas.addEventListener('click', e => this.handleClick(e))
    this._canvas.addEventListener('mousemove', e => this.handleMouseMove(e))

    this.reset()
  }

  start(){
    this.activeGame = true
    if(this.ball.velocity.x === 0 && this.ball.velocity.y === 0){
      // Randomize speed and direction
      this.ball.velocity.x = 300 * (Math.random() > .5  ? 1 : -1)
      this.ball.velocity.y = 300 * (Math.random() * 2 - 1)

      // normalize speed
      this.ball.velocity.speedNormalizer = 200;
    }
  }

  pause(){
    this.ball.velocity.x = 0
    this.ball.velocity.y = 0
  }

  reset(){
    this.activeGame = false
    this.ball.position.x = this._canvas.width / 2
    this.ball.position.y = this._canvas.height / 2
    this.ball.velocity.x = 0
    this.ball.velocity.y = 0
  }

  draw() {
    // draw background
    this._canvasContext.fillStyle = '#1f1f1f'
    this._canvasContext.fillRect(0, 0, this._canvas.width, this._canvas.height)
    // draw fence
    this._canvasContext.fillStyle = '#e6e6e6'
    this._canvasContext.fillRect((this._canvas.width/2) - 5, 0, 10, this._canvas.height)
    // draw ball
    this.ball.draw(this._canvasContext)
    // draw paddles
    this.players.forEach(player => player.draw(this._canvasContext))
    // draw score
    this._renderScore()
  }

  update(deltaTime) {
    this.ball.position.x += this.ball.velocity.x * deltaTime
    this.ball.position.y += this.ball.velocity.y * deltaTime

    // check if ball touches bounds of canvas
    if(this.ball.left < 0 || this.ball.right > this._canvas.width) {
      const player = this.ball.velocity.x < 0 | 0
      this.players[player].score++
      this._checkWin()
      this.reset()
    }

    // if ball touches top or bottom, invert velocity
    if(this.ball.top < 0 || this.ball.bottom > this._canvas.height){
      this.ball.velocity.y = -this.ball.velocity.y
    }

    // ai following ball
    this._moveAi()  

    // check for collisions with player
    this.players.forEach(player => player.checkCollision(this.ball))

    this.draw();
  }

  get settings(){
    return {
      hasAi: true,
      aiIsOn: this.aiPlayer,
      hasDifficulty: false,
    }
  }

  // change difficulty, toggle ai
  set settings(gameSettings){
    if(gameSettings.aiIsOn !== undefined){
      this.aiPlayer = gameSettings.aiIsOn
    }
  }

  _checkWin(){
    if(this.players[0].score >= this.winCount ||
       this.players[1].score >= this.winCount){
         console.log('WINNER')
       }
  }
  _moveAi(){
    if(this.aiPlayer){
      this.players[1].position.y = this.ball.position.y
    }       
  }
  _renderScore(){
    this.players.forEach((player, index) => {
      this._canvasContext.fillStyle = 'white'
      this._canvasContext.font = `30px Dosis`
      this._canvasContext.fillText(
        // txt to display
        player.score ,
        // x position for text at center of player frame with centered text
        (index === 0 ? this._canvas.width * 0.25:this._canvas.width * 0.75) - this._canvasContext.measureText(player.score).width/2,
        // y position for text
        50)
    })
  }
  handleMouseMove(e){
    const scale = event.offsetY / event.target.getBoundingClientRect().height
    this.players[0].position.y = this._canvas.height * scale
  }
  
  handleClick(e){
    if(!this.activeGame){
      this.start()
    }
  }
}