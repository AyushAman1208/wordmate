"use client";
import { createContext,useState } from "react";
import { Socket } from "socket.io-client";

export const TurnContext = createContext<{
    turn: string | null;
    setTurn: (player: string) => string;
  }>({
    turn: null,
    setTurn: (player) => {return player},
  });

export function TurnContextProvider(props:any){
    const [turn,setTurn]=useState<string | null>(null)
    function setTurnHandler(player:string){
        setTurn(player)
        return player
    }

    const context={
        turn:turn,
        setTurn:setTurnHandler,
    }
    return (
        <TurnContext.Provider value={context}>
            {props.children}
        </TurnContext.Provider>
    )
}


export default TurnContextProvider;