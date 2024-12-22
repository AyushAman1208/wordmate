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
    if (this.turn === this.player1.id) {
      this.turn = this.player2.id;
    } else if (this.turn === this.player2.id) {
      this.turn = this.player1.id;
    }
    this.scoringMechanism(row, col, move);
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

    // horizontal
    for (let i = 0; i <= col; i++) {
      let currStr = "";
      for (let k = i; k <= col; k++) {
        currStr += this.board[row][k];
      }
      if (this.isWord(currStr) && this.wordsUsed.includes(currStr) === false) {
        this.handleScoreUpdate(currStr);
        currWords.push(currStr);
      }
      if (
        this.isWord(reverseString(currStr)) &&
        this.wordsUsed.includes(reverseString(currStr)) === false
      ) {
        this.handleScoreUpdate(reverseString(currStr));
        currWords.push(reverseString(currStr));
      }
      for (let j = col + 1; j < 8; j++) {
        currStr += this.board[row][j];
        if (
          this.isWord(currStr) &&
          this.wordsUsed.includes(currStr) === false
        ) {
          this.handleScoreUpdate(currStr);
          currWords.push(currStr);
        }
        if (
          this.isWord(reverseString(currStr)) &&
          this.wordsUsed.includes(reverseString(currStr)) === false
        ) {
          this.handleScoreUpdate(reverseString(currStr));
          currWords.push(reverseString(currStr));
        }
      }
    }

    //verticle
    for (let i = 0; i <= row; i++) {
      let currStr = "";
      for (let k = i; k <= row; k++) {
        currStr += this.board[k][col];
      }
      if (this.isWord(currStr) && this.wordsUsed.includes(currStr) === false) {
        this.handleScoreUpdate(currStr);
        currWords.push(currStr);
      }
      if (
        this.isWord(reverseString(currStr)) &&
        this.wordsUsed.includes(reverseString(currStr)) === false
      ) {
        this.handleScoreUpdate(reverseString(currStr));
        currWords.push(reverseString(currStr));
      }
      for (let j = row + 1; j < 8; j++) {
        currStr += this.board[j][col];
        if (
          this.isWord(currStr) &&
          this.wordsUsed.includes(currStr) === false
        ) {
          this.handleScoreUpdate(currStr);
          currWords.push(currStr);
        }
        if (
          this.isWord(reverseString(currStr)) &&
          this.wordsUsed.includes(reverseString(currStr)) === false
        ) {
          this.handleScoreUpdate(reverseString(currStr));
          currWords.push(reverseString(currStr));
        }
      }
    }

    //diagonal
    for (let i = 0; i <= row; i++) {
      for (let j = 0; j <= col; j++) {
        let currStr = "";
        for (let k = i, l = j; k <= row && l <= col; k++, l++) {
          currStr += this.board[k][l];
        }
        if (
          this.isWord(currStr) &&
          this.wordsUsed.includes(currStr) === false
        ) {
          this.handleScoreUpdate(currStr);
          currWords.push(currStr);
        }
        if (
          this.isWord(reverseString(currStr)) &&
          this.wordsUsed.includes(reverseString(currStr)) === false
        ) {
          this.handleScoreUpdate(reverseString(currStr));
          currWords.push(reverseString(currStr));
        }
      }
    }
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
    return allWords.hasOwnProperty(word.toLowerCase()) && word.length >= 3;
  }

  public getWinner() {
    if (this.scoreplayer1 > this.scoreplayer2) {
      return this.player1.id;
    }
    return this.player2.id;
  }
}
