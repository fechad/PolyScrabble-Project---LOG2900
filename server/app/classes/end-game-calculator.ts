import { ALPHABET } from '@app/alphabet-template';
import { Reserve } from '@app/classes/reserve';
import { Player } from '@app/classes/room';
import * as constants from '@app/constants';

export class EndGameCalculator {
    static calculateFinalScores(scores: number[], reserve: Reserve) {
        const mainRackScore = reserve.letterRacks[constants.MAIN_PLAYER].map((letter) => ALPHABET[letter].score).reduce((acc, x) => acc + x, 0);
        const otherRackScore = reserve.letterRacks[constants.OTHER_PLAYER].map((letter) => ALPHABET[letter].score).reduce((acc, x) => acc + x, 0);
        if (reserve.getCount() === 0 && mainRackScore === 0) {
            scores[constants.MAIN_PLAYER] += otherRackScore;
            scores[constants.OTHER_PLAYER] -= otherRackScore;
        } else if (reserve.getCount() === 0 && otherRackScore === 0) {
            scores[constants.OTHER_PLAYER] += mainRackScore;
            scores[constants.MAIN_PLAYER] -= mainRackScore;
        } else {
            scores[constants.MAIN_PLAYER] -= mainRackScore;
            scores[constants.OTHER_PLAYER] -= otherRackScore;
        }
    }

    static createGameSummaryMessage(players: Player[], reserve: Reserve): string {
        const mainLetterList = reserve.letterRacks[constants.MAIN_PLAYER].join('');
        const otherLetterList = reserve.letterRacks[constants.OTHER_PLAYER].join('');
        const summary =
            'Fin de partie - lettres restantes \n' +
            `\n${players[constants.MAIN_PLAYER].name}: ${mainLetterList} \n ` +
            `\n${players[constants.OTHER_PLAYER].name}: ${otherLetterList} \n `;
        return summary;
    }
}
