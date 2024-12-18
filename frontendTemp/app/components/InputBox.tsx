"use client";
import { useEffect, useState } from "react";
import { Socket } from 'socket.io-client';

function InputBox({ row, col, socket, gameId }: { row: number, col: number, socket: Socket, gameId: string | null }) {
  const color =
    (row % 2 === 0 && col % 2 == 0) ||
      (row % 2 !== 0 && col % 2 !== 0)
      ? "bg-slate-300"
      : "bg-white";
  const [inputStatus, setInputStatus] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [turn, setTurn] = useState(false)
  socket.on("updateGame", ({ board, playedRow, playedCol }) => {
    if (playedCol == col - 1 && playedRow == row - 1) {
      setInputStatus(true)
      setInputValue(board[row - 1][col - 1])
    }
  })

  return (
    <div className="">
      <form
        action="#"
        onSubmit={(e) => {
          e.preventDefault();
          setInputStatus(true);
          socket.emit("makeMove", { gameId: gameId, row: row - 1, col: col - 1, move: inputValue });
        }}
      >
        <input
          value={inputValue}
          disabled={inputStatus || !turn}
          onChange={(e) => {
            setInputValue(
              e.target.value[e.target.value.length - 1].toUpperCase()
            );
          }}
          type="text"
          name={`input-text${row}${col}`}
          id="input-text"
          className={`w-10 h-10 border-2 border-black text-black font-extrabold text-[30px] ${color}`}
        />
      </form>
    </div>
  );
}

export default InputBox;