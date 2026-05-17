/* ================= FETCH USER ID BY USERNAME ================= */

import type { User } from "../types/Types";

export async function fetchUidByUsername(username: string): Promise<number> {
    try {
        const res = await fetch(
            `https://webdev.aboutkonrad.com/api/users/username/${encodeURIComponent(username)}`,
        );
        if (!res.ok) {
            throw new Error(`Failed to fetch user data: ${res.statusText}`);
        }
        const data = await res.json();

        if (!data?.uid) {
            throw new Error("Invalid user data");
        }
        return data.uid;
    } catch (error) {
        console.error("Error fetching user ID:", error);
        throw new Error("Failed to fetch user ID");
    }
}

/* ================= FETCH USER BY USERNAME ================= */

export async function fetchUserByUsername(username: string): Promise<User> {
    try {
        const res = await fetch(
            `https://webdev.aboutkonrad.com/api/users/username/${encodeURIComponent(username)}`,
        );
        if (!res.ok) {
            throw new Error(`Failed to fetch user data: ${res.statusText}`);
        }
        const data = await res.json();
        if (!data?.uid) {
            throw new Error("Invalid user data");
        }
        return data;
    } catch (error) {
        console.error("Error fetching user data:", error);
        throw new Error("Failed to fetch user data");
    }
}

/* ================= FETCH USER BY UID ================= */

export async function fetchUserByUid(uid: number): Promise<User> {
    try {
        const res = await fetch(`https://webdev.aboutkonrad.com/api/users/id/${encodeURIComponent(uid)}`);
        if (!res.ok) {
            throw new Error(`Failed to fetch user data: ${res.statusText}`);
        }
        const data = await res.json();
        if (!data?.uid) {
            throw new Error("Invalid user data");
        }
        return data;
    } catch (error) {
        console.error("Error fetching user data:", error);
        throw new Error("Failed to fetch user data");
    }
}