const specialLetters: { [key: string]: string } = {
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
const LOWERCASE_A_ASCII = 97;
export class CommandParsing {
    isUpperCaseLetter(character: string) {
        return character.match(/A-Z/g);
    }

    validatePositionSyntax(position: string[], oneLetter: boolean): boolean {
        if (position[0].match(/[a-o]/g) !== null) {
            if ((position[2] === undefined && oneLetter) || position[2].match(/[hv]/g) !== null) {
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

    removeAccents(word: string): string {
        let returnWord = '';
        for (const originalLetter of word) {
            const letter = specialLetters[originalLetter.toLowerCase()];
            if (letter !== undefined) {
                returnWord += originalLetter === originalLetter.toUpperCase() ? letter.toUpperCase() : letter;
            } else {
                returnWord += originalLetter;
            }
        }
        return returnWord;
    }

    isNotPlayableWord(playedWord: string) {
        return playedWord.match(/[^A-Za-zÀ-ú]/g);
    }

    areValidCharactersToExchange(charactersToExchange: string) {
        return charactersToExchange.match(/[^a-z*]/g);
    }

    isValidVerticalPosition(position: string) {
        return position.match(/[a-o]/g);
    }

    isValidHorizontalPosition(position: string) {
        const DOUBLE_DIGIT_LENGTH = 2;
        if (position.length > DOUBLE_DIGIT_LENGTH) return false;
        const firstDigitIsValid = position[0].match(/[1-9]/g);
        return position.length === DOUBLE_DIGIT_LENGTH ? position[0].match(/[1]/g) && position[1].match(/[0-5]/g) : firstDigitIsValid;
    }

    isValidOrientation(orientation: string) {
        return orientation.match(/[hv]/g);
    }

    getVerticalIndex(position: string) {
        return position.charCodeAt(0) - LOWERCASE_A_ASCII;
    }

    isHorizontalOrientation(orientation: string | undefined) {
        return orientation === undefined ? undefined : orientation === 'h';
    }
}
