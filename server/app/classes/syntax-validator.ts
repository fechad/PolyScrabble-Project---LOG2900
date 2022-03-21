const specialLetters = {
    é: 'e',
    è: 'e',
    ê: 'e',
    ë: 'e',
    à: 'a',
    â: 'a',
    ä: 'a',
    ï: 'i',
    î: 'i',
    ô: 'o',
    ö: 'o',
    ù: 'u',
    û: 'u',
    ü: 'u',
    ÿ: 'y',
    ç: 'c',
};

export class SyntaxValidator {
    static separatePosition(position: string): string[] {
        const positionArray: string[] = [];
        positionArray[0] = position.charAt(0);
        if (position.length === 3) {
            if (isNaN(+position.charAt(2))) {
                positionArray[1] = position.charAt(1);
                positionArray[2] = position.charAt(2);
            } else {
                positionArray[1] = position.charAt(1) + position.charAt(2);
            }
        } else if (position.length === 2) {
            positionArray[1] = position.charAt(1);
        } else {
            positionArray[1] = position.charAt(1) + position.charAt(2);
            positionArray[2] = position.charAt(3);
        }
        return positionArray;
    }

    static validatePositionSyntax(position: string[], oneLetter: boolean): boolean {
        const hasOrientation = position[2].match(/[hv]/g) !== null;

        if (position[0].match(/[a-o]/g) !== null) {
            if ((position[2] === undefined && oneLetter) || hasOrientation) {
                if (position[1].length === 1) {
                    if (position[1].match(/[1-9]/g) !== null) {
                        return true;
                    }
                }
                if (position[1].length === 2) {
                    if (position[1][1].match(/[0-5]/g) !== null && position[1][0] === '1') {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    static removeAccents(word: string): string {
        let returnWord = '';
        for (const originalLetter of word) {
            const letter = specialLetters[originalLetter.toLowerCase()];
            if (letter !== undefined) {
                returnWord += originalLetter === originalLetter.toLocaleUpperCase() ? letter.toUpperCase() : letter;
            } else {
                returnWord += originalLetter;
            }
        }
        return returnWord;
    }
}
