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
    static isUpperCaseLetter(character: string) {
        return character.match(/A-Z/g);
    }

    static removeAccents(word: string): string {
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

    static isPlayableWord(playedWord: string) {
        return playedWord.match(/[A-Za-zÀ-ú]/g);
    }

    static areValidCharactersToExchange(charactersToExchange: string) {
        return charactersToExchange.match(/[a-z*]/g);
    }

    static isValidVerticalPosition(position: string) {
        return position.match(/[a-o]/g);
    }

    static isValidHorizontalPosition(position: string) {
        const DOUBLE_DIGIT_LENGTH = 2;
        if (position.length > DOUBLE_DIGIT_LENGTH) return false;
        const firstDigitIsValid = position[0].match(/[1-9]/g);
        return position.length === DOUBLE_DIGIT_LENGTH ? position[0].match(/[1]/g) && position[1].match(/[0-5]/g) : firstDigitIsValid;
    }

    static isValidOrientation(orientation: string) {
        return orientation.match(/[hv]/g);
    }

    static getVerticalIndex(position: string) {
        return position.charCodeAt(0) - LOWERCASE_A_ASCII;
    }

    static isHorizontalOrientation(orientation: string | undefined) {
        return orientation === undefined ? undefined : orientation === 'h';
    }

    static containsIllegalCharacters(command: string) {
        return command.match(/[A-Za-zÀ-ú0-9*!?]/g);
    }
}
