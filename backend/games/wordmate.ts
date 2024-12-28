// @ts-ignore
import { reverseString } from "../utils/helpers";
import allWords from "./dict";
import { Server, Socket } from "socket.io";

export class WordMateGame {
  public player1: Socket;
  public player2: Socket;
  public player1Name: string = "";
  public player2Name: string = "";
  public players: Array<Socket> = [];
  private moves: Array<any> = [];
  private scoreplayer1 = 0;
  private scoreplayer2 = 0;
  private pointSeqPlayer1: number[] = [];
  private wordsUserPlayer1: string[] = [];
  private wordsUserPlayer2: string[] = [];
  private pointSeqPlayer2: number[] = [];
  private turn: string = "";
  private end: boolean = false;
  private wordsUsed: string[] = [];
  private board: string[][] = [
    ["", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", ""],
  ];

  constructor(
    player1: any,
    player2: any,
    player1Name: string,
    player2Name: string
  ) {
    this.player1Name = player1Name;
    this.player2Name = player2Name;
    this.player1 = player1;
    this.player2 = player2;
    this.turn = player1.id;
    this.players = [player1, player2];
  }

  public getTurn(): string {
    return this.turn;
  }

  public isGameOver(): boolean {
    return this.end;
  }

  public makeMove(row: number, col: number, move: string) {
    this.board[row][col] = move;
    this.moves.push([row, col, move]);
    this.scoringMechanism(row, col, move);
    if (this.turn === this.player1.id) {
      this.turn = this.player2.id;
    } else if (this.turn === this.player2.id) {
      this.turn = this.player1.id;
    }
    if(this.moves.length === 64){
      this.end = true;
    }
  }
  public getScore(player: any): number {
    if (player === this.player1) {
      return this.scoreplayer1;
    }
    return this.scoreplayer2;
  }
  public getBoard(): string[][] {
    return this.board;
  }

  private handleScoreUpdate(word: string) {
    if (this.turn === this.player1.id) {
      this.wordsUserPlayer1.push(word);
      this.pointSeqPlayer1.push(word.length);
      this.scoreplayer1 += word.length;
    } else {
      this.wordsUserPlayer2.push(word);
      this.pointSeqPlayer2.push(word.length);
      this.scoreplayer2 += word.length;
    }
    this.wordsUsed.push(word);
  }
  private scoringMechanism(row: number, col: number, move: string) {
    const currWords: Array<string> = [];

    // Helper function to process a word and its reverse
    const processWord = (word: string) => {
        if (this.isWord(word) && !this.wordsUsed.includes(word)) {
            this.handleScoreUpdate(word);
            currWords.push(word);
        }
        const reversed = reverseString(word);
        if (this.isWord(reversed) && !this.wordsUsed.includes(reversed)) {
            this.handleScoreUpdate(reversed);
            currWords.push(reversed);
        }
    };

    // Process horizontal words
    for (let startCol = 0; startCol <= col; startCol++) {
        let currStr = "";
        for (let endCol = startCol; endCol < 8; endCol++) {
            currStr += this.board[row][endCol];
            processWord(currStr);
        }
    }

    // Process vertical words
    for (let startRow = 0; startRow <= row; startRow++) {
        let currStr = "";
        for (let endRow = startRow; endRow < 8; endRow++) {
            currStr += this.board[endRow][col];
            processWord(currStr);
        }
    }

    // Process diagonal words
    const processDiagonal = (startRow: number, startCol: number, rowStep: number, colStep: number) => {
        let currStr = "";
        let r = startRow, c = startCol;
        while (r >= 0 && r < 8 && c >= 0 && c < 8) {
            currStr += this.board[r][c];
            processWord(currStr);
            r += rowStep;
            c += colStep;
        }
    };

    // Diagonals (down-right)
    for (let startRow = 0; startRow <= row; startRow++) {
        processDiagonal(startRow, 0, 1, 1);
    }
    for (let startCol = 1; startCol <= col; startCol++) {
        processDiagonal(0, startCol, 1, 1);
    }

    // Diagonals (up-right)
    for (let startRow = row; startRow < 8; startRow++) {
        processDiagonal(startRow, 0, -1, 1);
    }
    for (let startCol = 1; startCol <= col; startCol++) {
        processDiagonal(7, startCol, -1, 1);
    }

    // Emit the updated scores and words
    this.players.forEach((player: Socket) =>
        player.emit("updateScore", {
            player1Name: this.player1Name,
            player2Name: this.player2Name,
            player1Score: this.scoreplayer1,
            player2Score: this.scoreplayer2,
            scoreSeqPlayer1: this.pointSeqPlayer1,
            scoreSeqPlayer2: this.pointSeqPlayer2,
            wordsFormed: currWords,
        })
    );
}

  public isWord(word: string) {
    return allWords.hasOwnProperty(word.toLowerCase()) && word.length >= 2;
  }

  public getWinner() {
    if (this.scoreplayer1 > this.scoreplayer2) {
      return this.player1.id;
    }
    return this.player2.id;
  }
}
