const boardEl = document.getElementById("board");

let board = [
['r','n','b','q','k','b','n','r'],
['p','p','p','p','p','p','p','p'],
['','','','','','','',''],
['','','','','','','',''],
['','','','','','','',''],
['','','','','','','',''],
['P','P','P','P','P','P','P','P'],
['R','N','B','Q','K','B','N','R']
];

let selected = null;
let turn = 'white';

const pieces = {
  'r':'♜','n':'♞','b':'♝','q':'♛','k':'♚','p':'♟',
  'R':'♖','N':'♘','B':'♗','Q':'♕','K':'♔','P':'♙'
};

function isWhite(p){ return p && p === p.toUpperCase(); }
function isBlack(p){ return p && p === p.toLowerCase(); }

function draw(){
  boardEl.innerHTML = '';
  for(let y=0;y<8;y++){
    for(let x=0;x<8;x++){
      let sq = document.createElement('div');
      sq.className = 'square ' + ((x+y)%2 ? 'black' : 'white');

      if(selected && selected.x === x && selected.y === y){
        sq.classList.add('selected');
      }

      let p = board[y][x];
      sq.textContent = pieces[p] || '';

      sq.onclick = () => click(x,y);
      boardEl.appendChild(sq);
    }
  }
}

function click(x,y){
  let p = board[y][x];

  if(selected){
    let moves = getMoves(selected.x, selected.y);
    if(moves.some(m => m.x === x && m.y === y)){
      move(selected.x, selected.y, x, y);
      turn = 'black';
      selected = null;
      draw();
      setTimeout(aiMove, 300);
      return;
    }
    selected = null;
  }

  if(p && isWhite(p) && turn === 'white'){
    selected = {x,y};
  }
  draw();
}

function move(x1,y1,x2,y2){
  board[y2][x2] = board[y1][x1];
  board[y1][x1] = '';
}

function getMoves(x,y){
  let p = board[y][x];
  if(!p) return [];

  let moves = [];
  let dir = isWhite(p) ? -1 : 1;

  if(p.toLowerCase() === 'p'){
    if(!board[y+dir]?.[x]) moves.push({x,y:y+dir});
    if(board[y+dir]?.[x+1] && isWhite(p)!==isWhite(board[y+dir][x+1])) moves.push({x:x+1,y:y+dir});
    if(board[y+dir]?.[x-1] && isWhite(p)!==isWhite(board[y+dir][x-1])) moves.push({x:x-1,y:y+dir});
  }

  if(p.toLowerCase() === 'r' || p.toLowerCase() === 'q'){
    [[1,0],[-1,0],[0,1],[0,-1]].forEach(d=>slide(x,y,d,moves,p));
  }

  if(p.toLowerCase() === 'b' || p.toLowerCase() === 'q'){
    [[1,1],[1,-1],[-1,1],[-1,-1]].forEach(d=>slide(x,y,d,moves,p));
  }

  if(p.toLowerCase() === 'n'){
    [[1,2],[2,1],[-1,2],[-2,1],[1,-2],[2,-1],[-1,-2],[-2,-1]]
      .forEach(d=>pushMove(x+d[0],y+d[1],moves,p));
  }

  if(p.toLowerCase() === 'k'){
    for(let dx=-1;dx<=1;dx++){
      for(let dy=-1;dy<=1;dy++){
        if(dx||dy) pushMove(x+dx,y+dy,moves,p);
      }
    }
  }

  return moves.filter(m=>inBoard(m.x,m.y));
}

function slide(x,y,d,moves,p){
  let nx=x+d[0], ny=y+d[1];
  while(inBoard(nx,ny)){
    if(board[ny][nx]){
      if(isWhite(p)!==isWhite(board[ny][nx])) moves.push({x:nx,y:ny});
      break;
    }
    moves.push({x:nx,y:ny});
    nx+=d[0]; ny+=d[1];
  }
}

function pushMove(x,y,moves,p){
  if(!inBoard(x,y)) return;
  if(!board[y][x] || isWhite(p)!==isWhite(board[y][x])){
    moves.push({x,y});
  }
}

function inBoard(x,y){ return x>=0 && y>=0 && x<8 && y<8; }

function aiMove(){
  let all=[];
  for(let y=0;y<8;y++){
    for(let x=0;x<8;x++){
      let p=board[y][x];
      if(p && isBlack(p)){
        let moves=getMoves(x,y);
        moves.forEach(m=>{
          let score=board[m.y][m.x]?10:1;
          all.push({from:{x,y},to:m,score});
        });
      }
    }
  }

  if(all.length===0) return;

  all.sort((a,b)=>b.score-a.score);
  let best=all[0];

  move(best.from.x,best.from.y,best.to.x,best.to.y);
  turn='white';
  draw();
}

draw();
