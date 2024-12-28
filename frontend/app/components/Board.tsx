import { Socket } from 'socket.io-client';
import InputBox from "./InputBox";
import { useContext } from 'react';
import { TurnContext } from '../providers/TurnProvider';
function Board({socket,gameId}:{socket:Socket, gameId:string|null}) {
    const arr = [1,2,3,4,5,6,7,8]
  return (
    <>
      
      <div className="flex items-center flex-col justify-center align-middle p-5 border-black">
        {
            arr.map?.((row,i) => (
                <div key={`${row} ${i}`}>{
                    <div className="flex flex-row p-0" >{arr.map?.((col) => (
                        <InputBox row = {row} col = {col} key={`${row} ${col}`} socket = {socket} gameId = {gameId} />
                    ))}</div>
                }</div>
            ))
        }
      </div>
    </>
  );
}

export default Board;