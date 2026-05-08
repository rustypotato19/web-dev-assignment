import { createContext } from "react";
import type { Cookies } from "react-cookie";

export type SessionContextType = {
    isLoggedIn: boolean;
    email: string | null;
    username: string | null;
    fullname: string | null;

    profileImage: string | null;

    setIsLoggedIn: (b: boolean) => void;
    setEmail: (s: string) => void;
    setUsername: (s: string) => void;
    setFullname: (s: string) => void;

    setProfileImage: (s: string) => void;

    sessionUserVariablesToContext: () => void;
    contextUserVariablesToSession: (cookies: Cookies, override?: {
        email?: string;
        username?: string;
        fullname?: string;
    }) => void;
}

const SessionContext = createContext<SessionContextType | null>(null);
export default SessionContext;