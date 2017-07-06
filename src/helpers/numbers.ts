export const dollarFormatter = (n: number): string => {
    n = Math.round(n);

    if (Math.abs(n) > 1000) {
        return `$${Math.round(n / 1000)}K`;
    }

    return `$${n}`;
};
