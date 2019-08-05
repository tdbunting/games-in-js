/* eslint-disable */

class Vector2 {
  constructor(x=0, y=0){
    this.x = x
    this.y = y
  }
}

class Segment{
  constructor(x, y){
    this.position = new Vector2(x, y)
    this.next = null;
    this.previous = null
  }
}

class Snake {
  constructor(x, y, length, segmentSize){
    this.length = length;
    this.segmentSize = segmentSize
    this.head = null;
    this.tail = null;

    for(var i = 0; i < this.length; i++){
      this.addSegment(x - (this.segmentSize * i), y)
    }
  }

  draw(ctx){
    var current = this.head
    while(current){
      ctx.fillStyle = 'white'
      ctx.fillRect(current.position.x, current.position.y, this.segmentSize, this.segmentSize)
      current = current.next
    }
  }
  addSegment(x, y){
    let seg = new Segment(x, y)

    if(!this.head){
      this.head = this.tail = seg
    }else {
      this.head.previous = seg
      seg.next = this.head
      this.head = seg
    }
  }

  deleteSegment(){
    if(this.tail){
      this.tail = this.tail.previous;
      this.tail.next = null;
    }
  }

  detectCollision(x, y) {
    let current = this.head
    
    while(current){
      if(current.position.x === x && current.position.y === y){
        return true
      }
      current = current.next
    }
    return false
  }

  move(direction, foodPosition){
    var x = this.head.position.x
    var y = this.head.position.y
    switch(direction){
      case 'LEFT':
        this.head.position.x -= this.segmentSize;
        break
      case 'RIGHT':
        this.head.position.x += this.segmentSize;
        break
      case 'UP':
        this.head.position.y -= this.segmentSize;
        break;
      case 'DOWN':
        this.head.position.y += this.segmentSize;
        break;
      default: 
        break
    }

    const collision = this.detectCollision(this.head.position.x, this.head.position.y)

    this.addSegment(x, y)
    this.deleteSegment()
  }
}



class SnakeGame {
  constructor(canvas){
    this._canvas = canvas;
    this._canvasContext = canvas.getContext('2d');

    this.grid = []
    this.unitSize = 8
    this._createGrid()

    this.speed = 250
    this.currentDirection = 'LEFT'

    this.snake = this._createSnakeAtRandomPos(8)

    let lastTimeEntered;
    const callback = ms => {
      if(lastTimeEntered){
        this.update((ms - lastTimeEntered)/1000)
      }
      lastTimeEntered = ms
      requestAnimationFrame(callback)
    }
    callback()
  }

  start (){

  }
  update(deltaTime){
    this.snake.move(this.currentDirection, null)
    this.draw()
  }
  pause(){

  }
  reset(){

  }
  draw(){
    // draw background.
    this._canvasContext.fillStyle = "#1f1f1f"
    this._canvasContext.fillRect(0, 0, this._canvas.width, this._canvas.height)
    // // draw Tiles
    
    // draw Snake
    this.snake.draw(this._canvasContext)
  }
  _createSnakeAtRandomPos(length){
    return new Snake(Math.floor(this._canvas.width/2), 
                     Math.floor(this._canvas.height/2), 
                     length, 
                     this.unitSize)
  }

  _createGrid(){
    for(var y = 0; y < this._canvas.height/this.unitSize; y++){
      this.grid.push([])
      for(var x = 0; x < this._canvas.width/this.unitSize; x++){
        this.grid[y].push(' ')
      }
    }
  }

  handleKeydown(e) {
    if (e.keyCode === 37 || e.keyCode === 65) {
      this.currentDirection = 'LEFT';
    } else if (e.keyCode === 39 || e.keyCode === 68) {
      this.currentDirection = 'RIGHT';
    } else if (e.keyCode === 38 || e.keyCode === 87) {
      this.currentDirection = 'UP';
    } else if (e.keyCode === 40 || e.keyCode === 83) {
      this.currentDirection = 'DOWN';
    }
    console.log(`Direction is now ${this.currentDirection}`)
  }
}
