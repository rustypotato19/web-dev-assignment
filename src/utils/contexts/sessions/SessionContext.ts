import { createContext } from "react";

export type SessionContextType = {
    isLoggedIn: boolean;
    email: string;
    username: string;

    setIsLoggedIn: (b: boolean) => void;
    setEmail: (s: string) => void;
    setUsername: (s: string) => void;

    deriveUserVariablesToContext: () => void;
}

const SessionContext = createContext<SessionContextType | null>(null);
export default SessionContext;