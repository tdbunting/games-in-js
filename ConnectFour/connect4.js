const COLORS = {
  red: '#ff4c00',
  yellow: '#ffe200',
  blue: '#3b83ca',
  black: '#1f1f1f',
  black50: 'rgba(0,0,0,0.5)',
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
    
    if(this.isHighlighted){
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
  get highlight(){
    return this.isHighlighted
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
    return this._checkBoardFull()
  }

  nextEmptyInCol(col){
    return this.cells.filter(cell => cell.col === col && cell.owner === null).pop()
  }

  // generic filter function iterating over cells
  filter(cb){
    return this.cells.filter(cb)
  }

  findEmptyCells(){
    let arrOfCol = [], res = []
    for(let x = 0; x < this.cols; x++){
      arrOfCol.push(this.filter(cell => cell.col === x + 1))
    }

    for(let i = 0; i < arrOfCol.length; i++){
      let col = arrOfCol[i]
      let done = false
      while(!done){
        const cell = col.pop()
        if(col.length === 0){
          done=true
        }
        if(!cell.owner){
          res.push(cell)
          done = true
        }
      }
      
    }
    return res
  }

  _checkBoardFull() {
    return this.cells.every(cell => cell.owner !== null)
  }

  reset(){
    this.cells.map(cell => {
      cell.owner = null
      cell.winner = false
    })
  }

  toMatrix(){
    let res = []
    for(let y = 0; y < this.rows; y++){
      res.push(this.cells.filter(cell => cell.row === y + 1))
    }
    return res
  }

  toSimpleMatrix(){
    return this.toMatrix().map(row => {
      return row.map(cell => cell.owner)
    })
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

    this.currentPlayer = 'Y'

    this.winner = null
    
    this.aiOn = true
    this.aiPlayer = 'R'
    this.aiTurn = false

    this.isActiveGame = false

    this.gameStartScreenActive = true
    this.gameOverScreenActive = false

    this._canvas.addEventListener('mousemove', e => this.handleMouseMove(e))
    this._canvas.addEventListener('click', e => this.handleClick(e))

    this._renderStartScreen()
  }
  
  start(){
    // first reset
    this.reset()

    // setup
    this._setupPlayers()
    this.isActiveGame = true
    
    this.gameStartScreenActive = false

    // run Loop
    this._loop()
  }
  _setupPlayers(){
    // if ai player choose at random if it goes first 
    if(this.aiOn){
      this.aiTurn = Math.round(Math.random() * 1) ? true : false
      this.player = this.aiTurn ? 'R' : 'Y'
      this.aiPlayer = this.player === 'Y' ? 'R' : 'Y'
    }
  }

  update(deltaTime){
    this.draw()

    this._aiMove(deltaTime)
  }

  draw(){
    this._canvasContext.fillStyle = '#3b83ca'
    this._canvasContext.fillRect(0, 0, this._canvas.width, this._canvas.height)
    this.board.draw(this._canvasContext)

    if(this.gameOverScreenActive){
      this._renderGameOverScreen()
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
    this.currentPlayer = 'Y'
    this.gameOverScreenActive = false
    this.board.reset()
    this.isActiveGame = false
  }
  
  _aiMove(){
    if(!this.aiTurn){ 
      return
    }
    // options
    let moveOptions = {
      win: [],
      block: [],
      nosig: [],
      lose: [],
    }

    var minPlayer = this.player;
    var maxPlayer = this.aiPlayer;

    let availableCells = this.board.findEmptyCells();
    availableCells.forEach(cell => {

      // AI win = priority 1
      cell.owner = maxPlayer
      if(this.checkWin(cell.row, cell.col)){
        moveOptions.win.push(cell.col)
      }
      else {
        // AI Blocks = Priority 2
        cell.owner = minPlayer
        if(this.checkWin(cell.row, cell.col)){
          moveOptions.block.push(cell.col)
        }else {
          cell.owner = maxPlayer

          // check cell above?
          if(cell.row - 2 > 0){
            
            // Ai Loses to player = priority 4
            this.board.cells[cell.id - 2].owner = minPlayer
            if(this.checkWin(cell.row-1, cell.col)){
              moveOptions.lose.push(cell.col)
            }
            // no loss = priority 3
            else {
              moveOptions.nosig.push(cell.col)
            }

            // deselect cell
            this.board.cells[cell.id - 2].owner = null
          }
          // no row above = third priority
          else {
            moveOptions.nosig.push(cell.col)
          }
        }
      }
      cell.owner = null
    })
    
    this.board.cells.forEach(cell => cell.winner = false)

    let randomOption = (options) => options[Math.floor(Math.random() * options.length)]
    // Random selection in priority order
    let col;
    if(moveOptions.win.length > 0){
      col = randomOption(moveOptions.win)
    }else if(moveOptions.block.length > 0){
      col = randomOption(moveOptions.block)
    }else if(moveOptions.nosig.length > 0){
      col = randomOption(moveOptions.nosig)
    }else if(moveOptions.lose.length > 0){
      col = randomOption(moveOptions.lose)
    }

    let move = this.board.nextEmptyInCol(col)

    move.highlight = this.currentPlayer

    // Delay computer for more realistic timing
    setTimeout(()=>{
      this._makeMove(move)
      this._aiMoving = false
    }, 500)
    
    this.aiTurn = false
   
  }

  switchCurrentPlayer(){
    this.currentPlayer = this.currentPlayer === 'Y' ? 'R' : 'Y'  
  }

  _makeMove(cell){
    cell.owner = this.currentPlayer
    cell.highlight = null

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

    this.switchCurrentPlayer()
  }
  // WIN LOGIC
  // checks a given row and column for a win
  checkWin(row, col){
    const res = {
      horiz: this.board.filter(cell => cell.row === row),
      vert:  this.board.filter(cell => cell.col === col),
      diagl: this.board.filter(cell => cell.row - cell.col === row - col),
      diagr: this.board.filter(cell => cell.row + cell.col === row + col),
    }

    return this._match4(res.horiz) || 
           this._match4(res.vert) ||
           this._match4(res.diagl) ||
           this._match4(res.diagr) 
  }

  // checks that a given array has 4 cells in a row that match
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

  //PUBLIC SETTINGS - one place to change and set after creation
  get settings(){
    return {
      aiIsOn: this.aiOn,
      hasAi: true,
      hasDifficulty: false
    }
  }

  // change difficulty, toggle ai
  set settings(gameSettings){
    if(gameSettings.aiIsOn !== undefined){
      this.aiOn = gameSettings.aiIsOn
    }
  }

  // RENDER FUNCTIONS
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
    this._canvasContext.fillStyle = COLORS.black50
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
  

  // INPUT HANDLERS
  handleMouseMove(e){
    if(this.aiTurn || this._aiMoving || !this.isActiveGame){
      return
    }
    const scalex = e.offsetX / e.target.getBoundingClientRect().width
    this.board.cells.forEach(cell => cell.highlight = null)
    const cellsToHighlight = this.board.filter(cell => cell.inCol(e.layerX + scalex) && cell.owner === null)
    if(cellsToHighlight.length > 0){
      cellsToHighlight[cellsToHighlight.length - 1].highlight = this.currentPlayer
    }  
  }

  handleClick(e){
    if(this.aiTurn || this._aiMoving){
      return
    }
    if(!this.isActiveGame){
      this.start()
    }else {
      const scalex = e.offsetX / e.target.getBoundingClientRect().width
      const cellToDropOn = this.board.filter(cell => cell.inCol(e.layerX + scalex) && cell.owner === null).pop()
      if(cellToDropOn){
        this._makeMove(cellToDropOn)
        if(this.aiOn && this.isActiveGame){
          this.aiTurn = true
          this._aiMoving = true
        }
      }
    }
  }
}