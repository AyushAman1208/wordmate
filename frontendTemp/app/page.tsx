'use client'
import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import Board from "./components/Board";
import Scorecard from "./components/Scorecard";

interface GameStartedEvent {
  gameId: string;
  opponent: string;
  symbol: string;
}

interface GameEndedEvent {
  winner: string | null;
}

let socket: Socket;

export default function GamePage() {
  const [message, setMessage] = useState<string>("Enter your name to start the game.");
  const [playerName, setPlayerName] = useState<string>("");
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [board, setBoard] = useState<(string | null)[]>(Array(64).fill(null));
  const [symbol, setSymbol] = useState<string>("");
  const [gameId, setGameId] = useState<string | null>(null);
  const [value,setValue] = useState<string>('')
  const [scorePlayer1,setScorePlayer1] = useState<number>(0)
  const [scorePlayer2,setScorePlayer2] = useState<number>(0)
  const [scoreSeqPlayer1,setScoreSeqPlayer1] = useState<number[]>([])
  const [scoreSeqPlayer2,setScoreSeqPlayer2] = useState<number[]>([])
  const [player1Name,setPlayer1Name] = useState<string>('')
  const [player2Name,setPlayer2Name] = useState<string>('')

  useEffect(() => {
    // Initialize socket connection
    socket = io("http://localhost:4000");

    // Listen for events from the server
    socket.on("waitingForOpponent", () => setMessage("Waiting for an opponent..."));

    socket.on("gameStarted", ({ gameId, opponent, symbol }: GameStartedEvent) => {
      setGameStarted(true);
      setMessage(`Game started! You're playing as ${symbol} against ${opponent}.`);
      setSymbol(symbol);
      setGameId(gameId);
    });

    socket.on("updateGame", (updatedBoard: (string | null)[]) => {
      setBoard(updatedBoard);
    });

    socket.on("gameEnded", ({ winner }: GameEndedEvent) => {
      if (winner) {
        setMessage(winner === socket.id ? "You won!" : "You lost!");
      } else {
        setMessage("It's a draw!");
      }
      setGameStarted(false);
    });

    socket.on("updateScore",({player1Name, player2Name, player1Score,player2Score,scoreSeqPlayer1,scoreSeqPlayer2})=>{
      setScorePlayer1(player1Score)
      setScorePlayer2(player2Score)
      setScoreSeqPlayer1(scoreSeqPlayer1)
      setScoreSeqPlayer2(scoreSeqPlayer2)
      setPlayer1Name(player1Name)
      setPlayer2Name(player2Name)
    })

    socket.on("errorMessage", (msg: string) => alert(msg));

    // Cleanup on component unmount
    return () => {
      socket.off("waitingForOpponent");
      socket.off("gameStarted");
      socket.off("updateGame");
      socket.off("gameEnded");
      socket.off("errorMessage");
      socket.disconnect();
    };
  }, []);

  const handleCellClick = (index: number): void => {
    if (gameStarted && board[index] === null && symbol) {
      socket.emit("makeMove", { gameId, index });
    }
  };

  const startGame = (): void => {
    if (playerName.trim()) {
      socket.emit("joinGame", playerName);
    } else {
      alert("Please enter a valid name.");
    }
  };

  return (
    <div>
      <h1>Tic Tac Toe</h1>
      {!gameStarted && (
        <div>
          <input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="Enter your name"
          />
          <button onClick={startGame}>Start Game</button>
        </div>
      )}
      <h2>{message}</h2>
      {gameStarted && (
        <div>
        <Board socket = {socket} gameId = {gameId}/>
        <Scorecard playerName= {player1Name} scoreSeq={scoreSeqPlayer1} totalScore={scorePlayer1}/>
        <Scorecard playerName={player2Name} scoreSeq={scoreSeqPlayer2} totalScore={scorePlayer2}/>
        </div>
      )}
    </div>
  );
}
