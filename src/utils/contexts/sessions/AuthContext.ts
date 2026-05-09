import { createContext } from "react";

export type AuthUser = {
    uid: number;
    email: string;
    username: string;
    fullname: string;
    date_of_birth: string;
    profile_image: string | null;
    created: string;
    updated: string;
};

export type AuthContextType = {
    isLoggedIn: boolean;
    user: AuthUser | null;

    setUser: (user: AuthUser | null) => void;
    setIsLoggedIn: (b: boolean) => void;

    /**
     * logs user out + clears state
     */
    logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export default AuthContext;