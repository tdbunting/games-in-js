/* eslint-disable */

class Cell {
  constructor(id, row, col, height, width){
    this.size = {
      height,
      width 
    }
    this.id = id
    this.row = row
    this.col = col
    this.val = ''
  }
  draw(ctx){
    // ctx.clearRect(this.left, this.top, this.size.width, this.size.height)
    ctx.fillStyle = 'white'
    ctx.textBaseline = 'middle'
    ctx.font = "50px Arial";
    var xcenter = (this.size.width * (this.col + 1)) - (this.size.width/2)
    var ycenter = (this.size.height * (this.row + 1)) - (this.size.height/2)
    ctx.fillText(this.value, xcenter - ctx.measureText(this.value).width/2, ycenter)
  }
  get bottom(){
    return this.row * this.size.height + this.size.height
  }
  get left(){
    return this.col * this.size.width
  }
  get right(){
    return this.col * this.size.width + this.size.width
  }
  get top(){
    return this.row * this.size.height
  }
  set value(val){
    this.val = val
  }
  get value(){
    return this.val
  }
}

class Grid {
  constructor(numRow, numCol, height, width){
    this.rows = numRow
    this.cols = numCol
    this.height = height
    this.width = width

    this.cells = this._createCells()
  }

  draw(ctx){
    // Draw Cells
    this._drawCells(ctx);
    // Draw Grid
    this._drawGrid(ctx);
  }

  getCellIndexAtPos(posx, posy){
    let cell = this.cells.filter(cell => {      
      return cell.left < posx && 
        cell.right > posx &&
        cell.top < posy &&
        cell.bottom > posy
      })

      return cell[0]
  }

  toMatrix(){
    let res = []
    for(let x = 0; x < this.cols; x++){
      res.push(this.cells.filter(cell => cell.row === x))
    }
    return res
  }

  _createCells(){
    let cellSize = {
      h: this.height/this.rows,
      w: this.width/this.cols
    }
    let cells = []
    let count = 0
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
       cells.push(new Cell(count, r, c, cellSize.h, cellSize.w))
       count++
      }

    }
    return cells;
  }

  _drawCells(ctx){
    this.cells.forEach(cell => cell.draw(ctx))
    
  }
  _drawGrid(ctx){
    // solid bg enforces redraw every frame
    ctx.strokeStyle = 'white'
    ctx.beginPath()
    // horizontal lines -- Rows
    for(var i = 1; i < this.rows; i++){
      ctx.moveTo(0, this.height/this.rows * i)
      ctx.lineTo(this.width, this.height/this.rows*i)
    }
    // vertical lines -- Columns
    for(var i = 1; i < this.cols; i++){
      ctx.moveTo(this.width/this.cols * i, 0)
      ctx.lineTo(this.width/this.cols * i, this.height)
    }
    ctx.stroke()
  }
}

class Board extends Grid{
  constructor(height, width){
    super(3, 3, height, width)
  }
  checkForWin(){
    return this._checkHorizontalWin() || 
           this._checkVerticalWin() || 
           this._checkDiagonalWin() ||
           this._checkBoardFull();
  }

  getFirstEmpty(){
    return this.cells.find(cell => cell.value === '')
  }
  findAllEmpty(){
    return this.cells.filter(cell => cell.value === '') || null
  }

  static findBestMove(board, difficulty){
    return Board.minimax(board, difficulty, 'O')//.index
  }

  static minimax(newBoard, depth, maximizingPlayer) {
    const availableSpots = newBoard.findAllEmpty()
    
    if(newBoard.checkForWin() === 'X'){
      return {score: -10}
    }else if(newBoard.checkForWin() === 'O'){
      return {score: 10}
    }else if (newBoard.checkForWin() === 'tie' || availableSpots.length < 1){
      return {score: 0}
    }
    var moves = []

    for(let i = 0; i < availableSpots.length; i++){
      const cellIndex = availableSpots[i].id
      var move = {}
      // store current cell in move object
      move.index = cellIndex
      // set current cell on the board = to max player 
      newBoard.cells[cellIndex].value = maximizingPlayer
      // debugger
      if(maximizingPlayer === 'O'){
        var result = Board.minimax(newBoard, depth - 1, 'X')
        move.score = result.score
      }else {
        var result = Board.minimax(newBoard, depth - 1, 'O')
        move.score = result.score
      }

      newBoard.cells[cellIndex].value = ''
      moves.push(move)
    }
    if(depth === 0){
      return moves[0]
    }else{
      var bestMove;
      if(maximizingPlayer === 'O'){
        var bestScore = -10000
        for(let i = 0; i < moves.length; i++){
          if(moves[i].score > bestScore){
            bestMove = i
            bestScore = moves[i].score
          }
        }
      }else{
        var bestScore = 10000
        for(let i = 0; i < moves.length; i++){
          if(moves[i].score < bestScore){
            bestScore = moves[i].score
            bestMove = i
          }
        }
      }
      
      return moves[bestMove]
    }
  }
  
  _checkHorizontalWin(){
    for (let i = 0; i < this.cells.length; i+=3) {
      if(this._match(this.cells[i].value, this.cells[i+1].value, this.cells[i+2].value)){
        return this.cells[i].value
      }
    }
    return null
  }
  _checkVerticalWin(){
    for (let i = 0; i < 3; i++) {
      if(this._match(this.cells[i].value, this.cells[i+3].value, this.cells[i+6].value)){
        return this.cells[i].value
      }
    }
    return null
  }
  _checkDiagonalWin(){
    if(this._match(this.cells[0].value, this.cells[4].value, this.cells[8].value)){
      return this.cells[0].value
    }else if(this._match(this.cells[6].value, this.cells[4].value, this.cells[2].value)){ 
      return this.cells[6].value
    }
    return null
  }
  _checkBoardFull(){
    const fullBoard = this.cells.every(cell => cell.value !== '')
    if(fullBoard){
      return 'tie'
    }
    return null
  }
  _match(...args){
    return args.every(v => (args[0] === v) && v !== '')
  }
}

class TicTacToeGame {
  constructor(canvas, options={}){
    this._canvas = canvas
    this._canvasContext = canvas.getContext('2d')
    
    this.isActiveGame = false;
    this.board = new Board(this._canvas.height, this._canvas.width)
    this.currentPlayer = 0;
    
    this.DIFFICULTY_LEVELS = {
      1: 2,
      2: 5,
      3: 10,
    }

    this.aiDifficulty = options.difficulty ? options.difficulty :2
    this.aiPlayer = options.aiIsOn ? options.aiIsOn : true;
    this._aiMoving = false

    this.winner = null
    
    // Setup Event Listeners
    this._canvas.addEventListener('click', e => this._handleClick(e))
    

    this._renderStartScreen()
  }

  get settings(){
    return {
      hasAi: true,
      aiIsOn: this.aiPlayer,
      hasDifficulty: true,
      difficulty: this.difficulty
    }
  }

  // change difficulty, toggle ai
  set settings(gameSettings){
    if(gameSettings.aiIsOn !== undefined){
      this.aiPlayer = gameSettings.aiIsOn
    }
    if(gameSettings.difficulty !== undefined){
      this.difficulty = gameSettings.difficulty
    }
  }

  get difficulty(){
    return this.aiDifficulty
  }

  set difficulty(val){
    this.aiDifficulty = parseInt(val)
  }

  draw(){
    this._canvasContext.fillStyle = '#1f1f1f'
    this._canvasContext.fillRect(0, 0, this._canvas.width, this._canvas.height)

    if(!this.isActiveGame && !this.winner){
      this._renderStartScreen()
    }else if(!this.isActiveGame && this.winner){
      this._renderGameOverScreen()
    }else {
      this.board.draw(this._canvasContext)
    }
  }
  makeMove(cell){
    if(cell.value !== ''){
      return
    }
    cell.value = this.currentPlayer === 0 ? 'X' : 'O';
    this.currentPlayer = this.currentPlayer === 0 ? 1 : 0;
    this._checkForWinner()
  }
  reset(){
    this.isActiveGame = false
    this.currentPlayer = 0
    this._aiMoving = false
    this.winner = null
    this.board = new Board(this._canvas.height, this._canvas.width)
  }
  start(){
    this.reset()
    this.isActiveGame = true;
    this._loop()
  }

  
  update(deltaTime){
    this.draw()

    if(this.currentPlayer === 1 && 
      !this._aiMoving &&
      this.aiPlayer &&
      this.isActiveGame){
      this._aiMoving = true
      this._aiMove()
    }
  }

  _aiMove(){
    setTimeout(()=>{
      const bestMove = Board.findBestMove(this.board, this.DIFFICULTY_LEVELS[this.aiDifficulty])
      this.makeMove(this.board.cells[bestMove.index])
      this._aiMoving = false
    }, 500)
  }

  _loop(){
    let timeLastEntered;
    const eventLoop = ms => {
      if(timeLastEntered){
        this.update((ms - timeLastEntered) / 1000);
      }
      timeLastEntered = ms
      requestAnimationFrame(eventLoop)
    }
    eventLoop()
  }

  _checkForWinner(){
    const cells = this.board.cells
    let winner = this.board.checkForWin()
    if (winner !== null){
      this.winner = winner
      this.isActiveGame = false
    }
  }

  _handleClick(e){
    if(!this.isActiveGame){
      this.start()
    }else if(this._aiMoving){
      // do nothing
      console.log('waiting for ai to move')
    }else {
      const cell = this.board.getCellIndexAtPos(e.offsetX, e.offsetY)
    
      this.makeMove(cell)
      this._checkForWinner()
    }
  }

  _renderStartScreen(){
    this._canvasContext.fillStyle = '#1f1f1f'
    this._canvasContext.fillRect(0, 0, this._canvas.width, this._canvas.height)
    let txt = 'Click to Play'
    let txtCenter = this._canvas.width /2
    this._canvasContext.fillStyle = 'white'
    this._canvasContext.textBaseline = 'middle'

    this._canvasContext.font = "50px Arial";
    this._canvasContext.fillText(txt, txtCenter - this._canvasContext.measureText(txt).width/2, this._canvas.height/2)
  }

  _renderGameOverScreen(){
    let txt = (this.winner === 'tie') ? `Draw` : `${this.winner} Wins!`
    let txt1 = 'Game Over'
    let txt2 = 'Click to Play Again'
    let txtCenter = this._canvas.width /2
    this._canvasContext.fillStyle = 'white'
  
    this._canvasContext.textBaseline = 'middle'
    this._canvasContext.font = "20px Arial";
    this._canvasContext.fillText(txt, txtCenter - this._canvasContext.measureText(txt).width/2, 50)
    this._canvasContext.font = "50px Arial";
    this._canvasContext.fillText(txt1, txtCenter - this._canvasContext.measureText(txt1).width/2, this._canvas.height/2)
    this._canvasContext.font = "16px Arial";
    this._canvasContext.fillText(txt2, txtCenter - this._canvasContext.measureText(txt2).width/2, this._canvas.height/2 + 35) 
  }
}