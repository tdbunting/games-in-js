/* eslint-disable */

const COLORS = {
  red: '#ff4c00',
  yellow: '#ffe200',
  blue: '#3b83ca',
  black: '#1f1f1f',
  white: '#e6e6e6'
}

class Vector2 {
  constructor(x=0, y=0){
    this.x = x
    this.y = y
  }
}

class Cell {
  constructor(id, x, y, width, height, col, row){
    this.id = id
    this.position = new Vector2(x, y)
    this.size = new Vector2(width, height)
    this.row = row
    this.col = col
    this.isHighlighted = null
    this.owner = null
    this.winner = false
  }
  contains(x, y){
    return x > this.left &&
           x < this.right &&
           y > this.top &&
           y < this.bottom

  }
  inCol(x){
    return x > this.left &&
           x < this.right
  }
  draw(ctx){
    let color = this.owner === null ? COLORS.white : this.owner === 'Y' ? COLORS.yellow : COLORS.red
    ctx.fillStyle = color
    ctx.beginPath();
    ctx.arc(this.left + this.size.x / 2, this.top + this.size.y / 2, this.radius, 0, Math.PI * 2);
    ctx.fill();
    
    if(this.isHighlighted !== null){
      this.drawHighlighting(ctx)
    }
  }
  drawHighlighting(ctx){
    let color = this.winner ? COLORS.black : this.isHighlighted === 'Y' ? COLORS.yellow : COLORS.red
    ctx.lineWidth = this.radius / 4
    ctx.strokeStyle = color
    ctx.arc(this.left + this.size.x / 2, this.top + this.size.y / 2, this.size.x * 0.7/2, 0, Math.PI * 2);
    ctx.stroke()
  }

  get top (){
    return this.position.y
  }
  get bottom (){
    return this.position.y + this.size.y 
  }
  set highlight(player){
    if(player !== null){ 
      this.isHighlighted = player
    }
    else {
      this.isHighlighted = null
    }
  }
  get left (){
    return this.position.x 
  }
  get radius(){
    return this.size.x * 0.7 / 2
  }
  get right (){
    return this.position.x + this.size.x
  }
}

class Board {
  constructor(rows, cols, width, height){
    this.size = new Vector2(width, height)
    this.rows = rows
    this.cols = cols
    this.cells = this._createCells()
  }
  draw(ctx){
    this.cells.forEach(cell => cell.draw(ctx))
  }

  _createCells(){
    let cellsize = this.size.y / this.rows

    let offesetx = (this.size.x - (cellsize * 7))/2
    
    let res = []
    for(var x = 0; x < this.cols; x++){
      for(var y = 0; y < this.rows; y++){
        let cellId = res.length + 1
        let newCell = new Cell(cellId ,offesetx +(cellsize * x), cellsize * y, cellsize, cellsize, x+1, y+1)
        res.push(newCell)
      } 
    }
    return res
  }

  get isFull(){
    return this.cells.every(cell => cell.owner)
  }

  findEmptyPositions(){
    let arrOfCol = [], res = []
    for(let x = 0; x < this.cols; x++){
      arrOfCol.push(this.cells.filter(cell => cell.col === x + 1))
    }

    for(let i = 0; i < arrOfCol.length; i++){
      let col = arrOfCol[i]
      let done = false
      while(!done){
        const cell = col.pop()
        if(!cell.owner || col.length === 0){
          res.push(cell)
          done = true
        }
      }
      
    }
    return res
  }

  toMatrix(){
    let res = []
    for(let y = 0; y < this.rows; y++){
      res.push(this.cells.filter(cell => cell.row === y + 1))
    }
    return res
  }
}

class Connect4Game {
  constructor(canvas, options={}){
    this._canvas = canvas
    this._canvasContext = canvas.getContext('2d')

    this.board = new Board(6, 7, this._canvas.width, this._canvas.height)
    
    this.rows = 6
    this.cols = 7

    this.player = 'Y'
    this.winner = null
    
    this.isActiveGame = false

    this.gameStartScreenActive = true
    this.gameOverScreenActive = false

    this._canvas.addEventListener('mousemove', e => this.handleMouseMove(e))
    this._canvas.addEventListener('click', e => this.handleClick(e))

    this._renderStartScreen()
  }
  
  start(){
    this.reset()
    this._loop()
    this.isActiveGame = true
    this.gameStartScreenActive = false
  }

  update(deltaTime){
    this.draw()
  }

  static findBestMove(board, difficulty, player){
    return Connect4Game.minimax(board, difficulty, player)
  }
  static minimax(newBoard, depth, maximizingPlayer, lastMove){
    const availableSpots = newboard.findEmptyPositions()
    // /** position would give minimizing player a win */ 
    // if(){
    //   return { score : -10 }
    // /** position would give maximizing player a win */ 
    // }else if(){
    //   return { score :  10 }
    // /** position results in a tie or there are no more spots */
    // }else if(this.checkWin(lastCell.row, lastCell.col) || availableSpots.length < 1){
    //   return { score :  0 }
    // }

    let moves = []
    for(let i=0; i < availableSpots.length; i++){
      const cellIndex = availableSpots[i].id
      var move = {}

      move.index  = cellIndex
      newBoard.cells[cellIndex].owner = maximizingPlayer

      if(maximizingPlayer === 'Y'){
        var result = Connect4Game.minimax(newBoard, depth - 1, 'R')
        move.score = result.score
      }else {
        var result = Connect4Game.minimax(newBoard, depth - 1, 'Y')
        move.score = result.score
      }

      newBoard.cells[cellIndex].owner = null
      moves.push(move)
    }

    if(depth === 0){
      return moves[0]
    }else {
      var bestMove;
      if(maximizingPlayer === ''){
        var bestScore = -10000
        for(let i = 0; i < moves.length; i++){
          if(moves[i].score > bestScore){
            bestMove = i
            bestScore = moves[i].score
          }
        }
      }else {
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


  checkWin(row, col){
    const res = {
      horiz: [],
      vert: [],
      diagl: [],
      diagr: [],
    }
    this.board.cells.forEach(cell => {
      // Horizontal Check
      if(cell.row === row){
        res.horiz.push(cell)
      }
      // Vertical Check
      if(cell.col === col){
        res.vert.push(cell)
      }
      // Diagonal Left Check
      if(cell.row - cell.col === row - col){
        res.diagl.push(cell)
      }
      // Diagonal Right Check
      if(cell.row + cell.col === row + col){
        res.diagr.push(cell)
      }
    })

    return this._match4(res.horiz) || 
           this._match4(res.vert) ||
           this._match4(res.diagl) ||
           this._match4(res.diagr) 
  }

  draw(){
    this._canvasContext.fillStyle = '#3b83ca'
    this._canvasContext.fillRect(0, 0, this._canvas.width, this._canvas.height)
    this.board.draw(this._canvasContext)

    if(this.gameOverScreenActive){
      this._renderGameOverScreen()
    }
  }

  get settings(){
    return {
      aiIsOn: this.aiPlayer,
      hasAi: false,
      hasDifficulty: false
    }
  }

  // change difficulty, toggle ai
  set settings(gameSettings){
    if(gameSettings.aiIsOn !== undefined){
      this.aiPlayer = gameSettings.aiIsOn
    }
  }


  _loop(){
    let lastTimeEntered;
    const eventLoop = (ms) => {
      if(lastTimeEntered){
        // check run time and convert to seconds
        this.update((ms - lastTimeEntered) / 1000)
      }
      lastTimeEntered = ms
      // start animation recursion
      requestAnimationFrame(eventLoop)
    }
    eventLoop()
  }

  reset(){
    this.winner = null
    this.gameOverScreenActive = false
    this.board = new Board(6, 7, this._canvas.width, this._canvas.height)
    this.isActiveGame = false
  }

  _match4(cells = []){
    let count = 0, lastOwner = null
    let winningCells = []
  
    for(let i = 0; i < cells.length; i++){
      const cell = cells[i]
      
      if(cell.owner === null){
        // cell owner null
        count = 0
        winningCells = []
      }else if(cell.owner === lastOwner){
        // cell is of last owner
        count ++
        winningCells.push(cell)
      }else {
        // first cell from this owner
        count = 1
        winningCells = []
        winningCells.push(cell)
      }

      lastOwner = cell.owner

      if (count === 4){
        for(var c of winningCells){
          c.winner = true
        }
        
        return true
      }
    }
    return false
  }

  _aiMove(){

  }

  _makeMove(cell){
    cell.owner = this.player === 'Y' ? 'Y' : 'R'
    cell.highlight = null
    this.player = this.player === 'Y' ? 'R' : 'Y'  

    let winner = this.checkWin(cell.row, cell.col)
    if(winner){
      this.winner = cell.owner
      this.isActiveGame = false
      this.gameOverScreenActive = true
    }else if(!winner && this.board.isFull){
      this.winner = 'T'
      this.isActiveGame = false
      this.gameOverScreenActive = true
    }
  }

  _renderStartScreen(){
    // reset bg
    this._canvasContext.fillStyle = COLORS.black
    this._canvasContext.fillRect(0, 0, this._canvas.width, this._canvas.height)

    // text
    this._canvasContext.fillStyle = COLORS.white
    this._canvasContext.textBaseline = 'middle'
    var title = 'Connect 4'
    var txtHCenter = this._canvas.width/2
    var txtVCenter = this._canvas.height/2
    this._canvasContext.font = '50px Arial'
    this._canvasContext.fillText(title, 
                                txtHCenter - this._canvasContext.measureText(title).width/2, 
                                txtVCenter - 30)
    
    this._canvasContext.font = '25px Arial'
    var playTxt = 'click to play'
    this._canvasContext.fillText(playTxt, 
                                 txtHCenter - this._canvasContext.measureText(playTxt).width/2, 
                                 txtVCenter + 30)
  }

  _renderGameOverScreen(){
    // reset bg
    this._canvasContext.fillStyle = COLORS.black
    this._canvasContext.fillRect(0, 0, this._canvas.width, this._canvas.height)

    // text
    this._canvasContext.fillStyle = COLORS.white
    this._canvasContext.textBaseline = 'middle'
    var goTxt = 'GAME OVER'
    var txtHCenter = this._canvas.width/2
    var txtVCenter = this._canvas.height/2
    this._canvasContext.font = '50px Arial'
    this._canvasContext.fillText(goTxt, 
                                txtHCenter - this._canvasContext.measureText(goTxt).width/2, 
                                txtVCenter - 30)
    
    this._canvasContext.font = '40px Arial'
    var winTxt = this.winner !== 'T' ? `${this.winner === 'Y'? 'Yellow': 'Red'} Wins!` : 'Tie Game!'
    this._canvasContext.fillText(winTxt, 
                                 txtHCenter - this._canvasContext.measureText(winTxt).width/2, 
                                 txtVCenter + 30)
  }
  
  handleMouseMove(e){
    const scalex = e.offsetX / e.target.getBoundingClientRect().width
    this.board.cells.forEach(cell => cell.highlight = null)
    const cellsToHighlight = this.board.cells.filter(cell => cell.inCol(e.layerX + scalex) && cell.owner === null)
    if(cellsToHighlight.length > 0){
      cellsToHighlight[cellsToHighlight.length - 1].highlight = this.player
    }  
  }

  handleClick(e){
    if(!this.isActiveGame){
      this.start()

    }else {
      const scalex = e.offsetX / e.target.getBoundingClientRect().width
      const cellToDropOn = this.board.cells.filter(cell => cell.inCol(e.layerX + scalex) && cell.owner === null).pop()
      if(cellToDropOn){
        this._makeMove(cellToDropOn)
      }
    }
}
}