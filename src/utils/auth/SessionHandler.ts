import { Cookies } from "react-cookie";

export function checkSession(): boolean {
    const cookies = new Cookies()

    // check for existence of cookie
    if (typeof document !== "undefined") {
        if (cookies.get("sessionId")) {
            console.log("Identified session")
            return true;
        }
    }

    console.log("Could not identify a session")
    return false;
}

export function getSessionId(): string | null {
    const cookies = new Cookies()

    if (typeof document !== "undefined" && checkSession()) {
        const sessionId = cookies.get("sessionId");
        if (sessionId) {
            return sessionId;
        }
    }
    return null;
}

export function getUsernamefromSession(): string | null {
    const cookies = new Cookies()

    if (typeof document !== "undefined" && checkSession()) {
        const username = cookies.get("username");
        if (username) {
            return username;
        }
    }
    return null;
}

export function setSession(email?: string, username?: string, fullname?: string, profileImage?: string): void {
    const cookies = new Cookies()
    const expires = new Date()
    expires.setFullYear(expires.getFullYear() + 1);
    if (email) cookies.set("email", email, { path: "/", expires });
    if (username) cookies.set("username", username, { path: "/", expires })
    if (fullname) cookies.set("fullname", fullname, { path: "/", expires })
    if (profileImage) cookies.set("profileImage", profileImage, { path: "/", expires })
    cookies.set("loggedIn", true, { path: "/", expires });
    cookies.set("sessionId", crypto.randomUUID(), {
        path: "/",
        expires,
    });

    console.log(
        `Created cookie, set to expire on ${expires} \nLasting 1 year \nSessionID: ${cookies.get("sessionId")}`,
    );
}