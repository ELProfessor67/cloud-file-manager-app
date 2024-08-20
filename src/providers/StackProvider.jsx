import { Children, createContext, useState } from "react"

export const StackContext = createContext();


export const StackProvider = ({children}) => {
    const [history, setHistory] = useState([]);
    const [transcribeHistory, setTranscriveHistory] = useState([]);
    return(<StackContext.Provider value={{history,setHistory,transcribeHistory, setTranscriveHistory}}>
        {children}
    </StackContext.Provider>)
}