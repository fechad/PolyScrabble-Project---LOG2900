import * as constants from '@app/constants';
import { BehaviorSubject } from 'rxjs';
import { CommandParsing } from './command-parsing';
import { Letter } from './letter';

export class Rack {
    readonly rack: BehaviorSubject<Letter[]> = new BehaviorSubject([] as Letter[]);
    tempRack: Letter[];

    tempUpdate() {
        this.rack.next(this.tempRack);
    }

    attemptTempUpdate(letters: string) {
        const tempRack = [...this.rack.value];
        for (const letter of letters) {
            const index = tempRack.findIndex((foundLetter) => {
                return letter === foundLetter.name.toLowerCase() || (foundLetter.name === '*' && CommandParsing.isUpperCaseLetter(letter));
            });
            if (index === constants.MISSING) throw new Error('Ces lettres ne sont pas dans le chevalet.');
            tempRack[index] = tempRack[tempRack.length - 1];
            tempRack.pop();
        }
        this.tempRack = tempRack;
    }

    addTemp(letter: Letter) {
        this.tempRack.push(letter);
    }
}
