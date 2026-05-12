/* =========================
   EMAIL VALIDATION
========================= */
export function validEmail(email: string): boolean {
    const emailRegex =
        /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;

    return (
        typeof email === "string" &&
        emailRegex.test(email.trim()) &&
        email.length > 0 &&
        email.length <= 254
    );
}

/* =========================
   LOGIN PASSWORD VALIDATION
========================= */
export function validLoginPassword(password: string): boolean {
    return (
        typeof password === "string" &&
        password.length >= 8 &&
        password.length <= 127
    );
}

/* =========================
   FULL NAME VALIDATION
========================= */
export function validFullName(name: string): boolean {
    const nameRegex = /^[a-zA-Z ,.'-]+$/;

    return (
        typeof name === "string" &&
        nameRegex.test(name.trim()) &&
        name.length >= 3 &&
        name.length <= 127
    );
}

/* =========================
   USERNAME VALIDATION
========================= */
export function validUsername(uname: string): [boolean, string] {
    const unameRegex = /^\w+$/;

    if (!uname) return [false, "Username required"];
    if (uname.length < 3) return [false, "Username too short"];
    if (uname.length > 50) return [false, "Username too long"];
    if (!unameRegex.test(uname))
        return [false, "Only letters, numbers and '_' allowed"];

    return [true, "OK"];
}

/* =========================
   DOB VALIDATION
========================= */
export function validDob(dob: Date): [boolean, string] {
    if (!dob || isNaN(dob.getTime())) {
        return [false, "Invalid date"];
    }

    const today = new Date();

    const minAgeDate = new Date(
        today.getFullYear() - 13,
        today.getMonth(),
        today.getDate()
    );

    const minYear = 1900;

    if (dob.getFullYear() < minYear) {
        return [false, "Date too far in past"];
    }

    if (dob > minAgeDate) {
        return [false, "Must be at least 13 years old"];
    }

    return [true, "OK"];
}

/* =========================
   SERVER HEALTH CHECK
========================= */
export async function validateServerConnection(): Promise<boolean> {
    try {
        const res = await fetch("https://webdev.aboutkonrad.com/health");

        if (!res.ok) return false;

        const data = await res.json();
        return data.status === "ok";
    } catch (err) {
        console.error("Server validation failed:", err);
        return false;
    }
}