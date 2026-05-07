export function validEmail(email: string): boolean {
    const emailRegex = /^((?!\.)[\w\-_.]*[^.])(@\w+)(\.\w+(\.\w+)?[^.\W])$/gm;

    return emailRegex.test(email) && email.length > 0 && email.length <= 254;
}

export function validLoginPassword(password: string): boolean {
    return password.length >= 8 && password.length <= 127;
}

export function validFullName(name: string): boolean {
    const nameRegex = /^[a-z ,.'-]+$/i;

    return nameRegex.test(name) && name.length >= 3 && name.length <= 127;
}

export function validUsername(uname: string): [boolean, string] {
    const unameRegex = /^\w+$/; // 👈 allow 1+ word chars

    if (uname.length < 3) return [false, "Entered username too short"]
    if (uname.length > 127) return [false, "Entered username too long"]
    if (!unameRegex.test(uname)) return [false, "No special characters other than '_'"]
    return [true, "OK"]
}

export function validDob(dob: Date): [boolean, string] {
    if (!dob || isNaN(dob.getTime())) return [false, "No date passed"];

    const today = new Date();

    const minYear = 1900;

    // max allowed date = today minus 13 years
    const minAgeDate = new Date(
        today.getFullYear() - 13,
        today.getMonth(),
        today.getDate()
    );

    const year = dob.getFullYear();

    if (year < minYear) return [false, "Date extends too far past"];
    if (dob > minAgeDate) return [false, "You must be at least 13 years old"];

    return [true, "OK"];
}