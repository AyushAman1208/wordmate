"use client";
import { useEffect, useState, useContext } from "react";
import { io, Socket } from "socket.io-client";
import Board from "./components/Board";
import Scorecard from "./components/Scorecard";
import SequentialWordAnimator from "./components/WordAnimator";
import Navbar from "./components/Navbar";
import { TurnContext } from "./providers/TurnProvider";

interface GameStartedEvent {
  gameId: string;
  opponent: string;
  symbol: string;
  player1Name: string;
  player2Name: string;
  turn: string
}

interface GameEndedEvent {
  winner: string | null;
}

let socket: Socket;

export default function GamePage() {
  const [message, setMessage] = useState<string>(
    "Enter your name to start the game."
  );
  const {turn, setTurn} = useContext(TurnContext);
  const [playerName, setPlayerName] = useState<string>("  ");
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [board, setBoard] = useState<(string | null)[]>(Array(64).fill(null));
  const [symbol, setSymbol] = useState<string>("");
  const [gameId, setGameId] = useState<string | null>(null);
  const [scorePlayer1, setScorePlayer1] = useState<number>(0);
  const [scorePlayer2, setScorePlayer2] = useState<number>(0);
  const [scoreSeqPlayer1, setScoreSeqPlayer1] = useState<number[]>([]);
  const [scoreSeqPlayer2, setScoreSeqPlayer2] = useState<number[]>([]);
  const [player1Name, setPlayer1Name] = useState<string>("");
  const [player2Name, setPlayer2Name] = useState<string>("");
  const [wordsFormed, setWordsFormed] = useState<string[]>([]);

  const gameEndCleanup = () => {
    setGameStarted(false);
    setBoard(Array(64).fill(null));
    setSymbol("");
    setGameId(null);
    setPlayer1Name("");
    setPlayer2Name("");
    setTurn("");
    setScorePlayer1(0);
    setScorePlayer2(0);
    setScoreSeqPlayer1([]);
    setScoreSeqPlayer2([]);
    setWordsFormed([]);
  };

  useEffect(() => {
    // Initialize socket connection
    socket = io(process.env.SOCKET_URL);

    // Listen for events from the server
    socket.on("waitingForOpponent", () =>
      setMessage("Waiting for an opponent...")
    );

    socket.on(
      "gameStarted",
      ({
        gameId,
        opponent,
        symbol,
        player1Name,
        player2Name,
        turn
      }: GameStartedEvent) => {
        setGameStarted(true);
        setMessage(
          `Game started! You're playing as ${symbol} against ${opponent}.`
        );
        setSymbol(symbol);
        setGameId(gameId);
        setPlayer1Name(player1Name);
        setPlayer2Name(player2Name);
        setTurn(turn);
      }
    );

    socket.on("updateGame", (updatedBoard: (string | null)[]) => {
      setBoard(updatedBoard);
    });

    socket.on("gameEnded", ({ winner }: GameEndedEvent) => {
      if (winner) {
        setMessage(winner === socket.id ? "You won!" : "You lost!");
      } else {
        setMessage("It's a draw!");
      }
      gameEndCleanup()
    });

    socket.on(
      "updateScore",
      ({
        player1Score,
        player2Score,
        scoreSeqPlayer1,
        scoreSeqPlayer2,
        wordsFormed,
      }) => {
        setScorePlayer1(player1Score);
        setScorePlayer2(player2Score);
        setScoreSeqPlayer1(scoreSeqPlayer1);
        setScoreSeqPlayer2(scoreSeqPlayer2);
        setWordsFormed(wordsFormed);
      }
    );

    socket.on("errorMessage", (msg: string) => alert(msg));
    socket.on("opponentResigned", (msg: string) => {
      
      setGameStarted(false);
      setMessage(msg);
      gameEndCleanup();
    });

    // Cleanup on component unmount
    return () => {
      socket.off("waitingForOpponent");
      socket.off("gameStarted");
      socket.off("updateGame");
      socket.off("gameEnded");
      socket.off("errorMessage");
      socket.off("opponentResigned");
      socket.disconnect();
    };
  }, [gameEndCleanup,setTurn]);
  const startGame = (): void => {
    if (playerName.trim()) {
      socket.emit("joinGame", playerName);
    } else {
      alert("Please enter a valid name.");
    }
  };

  useEffect(() => {
    console.log("Hydration check:", { gameStarted, playerName });
  }, [gameStarted, playerName]);
  

    return (
      <div>
        <Navbar />
        {gameStarted ? (
          <div>
            <SequentialWordAnimator words={wordsFormed} interval={500} />
            <Board socket={socket} gameId={gameId} />
    
            <Scorecard
              playerName={player1Name}
              scoreSeq={scoreSeqPlayer1}
              totalScore={scorePlayer1}
            />
            <Scorecard
              playerName={player2Name}
              scoreSeq={scoreSeqPlayer2}
              totalScore={scorePlayer2}
            />
    
            <button
              onClick={() => {
                if (gameId) {
                  socket.emit("resign", { gameId, resigningPlayer: socket.id });
                  setGameStarted(false); // Reset the game state on resign
                  setMessage("You have resigned. Your opponent wins.");
                  gameEndCleanup();
                }
              }}
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded mt-4"
            >
              Resign
            </button>
          </div>
        ) : (
          <div>
            <form
              action={"#"}
              onSubmit={(e) => {
                e.preventDefault();
                startGame();
              }}
            >
              <input
                type="text"
                id="playerName"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Enter your name"
                className="p-2 border border-gray-300 rounded-md w-[50%]"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    startGame();
                  }
                }}
              />
              <button
                id="startGameButton"
                type="submit"
                onTouchStart={startGame}
                onClick={startGame}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-[50%]"
              >
                Start Game
              </button>
            </form>
            {message && <p>{message}</p>}
          </div>
        )}
      </div>
    );
    
}
