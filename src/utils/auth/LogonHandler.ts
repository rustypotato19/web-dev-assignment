export function validEmail(email: string): boolean {
    const emailRegex = /^((?!\.)[\w\-_.]*[^.])(@\w+)(\.\w+(\.\w+)?[^.\W])$/gm;

    return emailRegex.test(email) && email.length > 0 && email.length <= 254;
}

export function validLoginPassword(password: string): boolean {
    return password.length >= 8 && password.length <= 128;
}