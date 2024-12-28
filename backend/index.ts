// backend/server.js
import express from "express";
import { WordMateGame } from "./games/wordmate.ts";
import { Server, Socket } from "socket.io";
import http from "http";
import 'dotenv/config'

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: process.env.FRONTEND_URL, methods: ["GET", "POST"] },
});
let waitingPlayer: any = null; // Stores the socket and name of the player waiting for an opponent
const games: any = {}; // Tracks active games by gameId

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("joinGame", (playerName) => {
    // Validate player name
    if (!playerName || typeof playerName !== "string") {
      socket.emit(
        "errorMessage",
        "Invalid name. Please enter a valid name to start the game."
      );
      return;
    }

    // Check if there's a player already waiting
    if (waitingPlayer && waitingPlayer.id !== socket.id) {
      // Pair with the waiting player
      const gameId = `${waitingPlayer.id}-${socket.id}`;
      const game = new WordMateGame(
        waitingPlayer,
        socket,
        waitingPlayer.name,
        playerName
      );
      games[gameId] = game;

      // Notify both players that the game has started
      waitingPlayer.emit("gameStarted", {
        gameId,
        opponent: playerName,
        symbol: "X",
        player1Name: game.player1Name,
        player2Name: game.player2Name,
        turn: game.getTurn(),
      });
      socket.emit("gameStarted", {
        gameId,
        opponent: waitingPlayer.name,
        symbol: "O",
        player1Name: game.player1Name,
        player2Name: game.player2Name,
        turn: game.getTurn(),
      });

      // Clear the waiting player as they are now in a game
      waitingPlayer = null;
    } else {
      // No waiting player, so this player will wait for an opponent
      waitingPlayer = socket;
      waitingPlayer.name = playerName;
      socket.emit("waitingForOpponent");
    }

    socket.on("resign", ({ gameId,resigningPlayer }) => {
      const game = games[gameId];
    
      if (game) {
        // Notify the opponent that the player has resigned
        game.players.forEach((player: Socket) => {
          if (player.id !== resigningPlayer) {
            game.winner = player.id;
            console.log(game.winner)
            player.emit("opponentResigned", { msg: "Your opponent has resigned. You win!" });
          }
        });
    
        // Clean up the game data
        delete games[gameId];
      }
    });
    // Handle player moves
    socket.on("makeMove", ({ gameId, row, col, move }) => {
      const game = games[gameId];

      if (game && socket.id === game.turn && game.board[row][col] === "") {
        game.makeMove(row, col, move);

        // Emit the updated board to both players
        game.players.forEach((player: Socket) =>
          player.emit("updateGame", {
            board: game.getBoard(),
            playedRow: row,
            playedCol: col,
            turn: game.turn,
          })
        );
        if (game.isGameOver()) {
          game.players.forEach((player: Socket) =>
            player.emit("gameEnded", { winner: game.getWinner() })
          );
          delete games[gameId]; // Clean up the game data
        }
      }
    });
  });

  // Handle player disconnect
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);

    // If the disconnected player was waiting for an opponent, clear the waiting player
    if (waitingPlayer && waitingPlayer.id === socket.id) {
      waitingPlayer = null;
    }

    // Remove player from any ongoing game they were part of
    for (const gameId in games) {
      const game = games[gameId];
      if (game.players.some((player: Socket) => player.id === socket.id)) {
        // Notify the other player of the disconnection
        game.players.forEach((player: Socket) => {
          if (player.id !== socket.id)
            player.emit("gameEnded", { winner: null });
        });
        delete games[gameId]; // Clean up the game data
        break;
      }
    }
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
