function Scorecard({playerName,scoreSeq, totalScore}:{playerName:string, scoreSeq:number[], totalScore:number}) {
 return (
     <div className="flex gap-x-1 bg-slate-300 items-stretch">
         <p className="p-1 text-lg font-bold w-[30%]">{playerName}</p>
         <div className="h-full w-[2px] bg-slate-500"></div>
         <p className="p-1 text-lg font-bold w-[10%]">{totalScore}</p>
         <div className="h-full w-[2px] bg-slate-500"></div>
         <div className="flex gap-x-1">{scoreSeq.map((score,i) => {return(
             <div key={i} className="flex gap-0">
                <p className=" p-1">{score}</p>
                <div className="h-full w-[1px] bg-slate-500"></div>

             </div>
         )})}</div>
     </div>
 ) 
}

export default Scorecard