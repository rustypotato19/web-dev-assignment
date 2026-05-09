export default function shorthandDateMonthToLong(date: string): string {
    const dm = date.replace(/[/\\]/g, "-").split("-");

    const d = dm[2];
    const m = parseInt(dm[1], 10);
    const y = parseInt(dm[0], 10) || new Date().getFullYear();

    const monthIndex: Record<number, string> = {
        1: "January",
        2: "February",
        3: "March",
        4: "April",
        5: "May",
        6: "June",
        7: "July",
        8: "August",
        9: "September",
        10: "October",
        11: "November",
        12: "December",
    };

    const month = monthIndex[m];

    const dayNum = parseInt(d, 10);

    let suffix = "th";
    if (dayNum % 100 < 11 || dayNum % 100 > 13) {
        switch (dayNum % 10) {
            case 1:
                suffix = "st";
                break;
            case 2:
                suffix = "nd";
                break;
            case 3:
                suffix = "rd";
                break;
        }
    }

    return `${dayNum}${suffix} ${month} ${y}`;
}