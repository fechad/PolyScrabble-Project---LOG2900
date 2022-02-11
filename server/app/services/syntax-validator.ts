export class SyntaxValidator {
    separatePosition(position: string): string[] {
        const positionArray: string[] = [];
        positionArray[0] = position.charAt(0);
        if (position.length === 3) {
            positionArray[1] = position.charAt(1);
            positionArray[2] = position.charAt(2);
        } else {
            positionArray[1] = position.charAt(1) + position.charAt(2);
            positionArray[2] = position.charAt(3);
        }
        return positionArray;
    }

    validatePositionSyntax(position: string[]): boolean {
        if (position[0].match(/[a-o]/g) !== null) {
            if (position[2].match(/[hv]/g) !== null) {
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

    /*
    validateWordSyntax(words: string[]): string[] {
        for(let word of words){
            let separatedWord = word.split(';');
            if(separatedWord[separatedWord.length -1].length < 2){
                return [];
            }
            for(let letter of separatedWord[separatedWord.length -1]){
                // TODO: remplacer accents par lettre normale
                console.log(letter);
            }
        }
        return words;
    }*/
}
