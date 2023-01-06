export function normalizeDotRule(searchValue: string, replaceValue = '/'): string {
    return searchValue.replace(/\./g, replaceValue);
}
