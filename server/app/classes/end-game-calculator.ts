import { ALPHABET } from '@app/alphabet-template';
import { Reserve } from '@app/classes/reserve';
import { Player } from '@app/classes/room';
import * as cst from '@app/constants';

export class EndGameCalculator {
    static calculateFinalScores(scores: number[], reserve: Reserve) {
        const mainRackScore = reserve.letterRacks[cst.MAIN_PLAYER].map((letter) => ALPHABET[letter].score).reduce((acc, x) => acc + x, 0);
        const otherRackScore = reserve.letterRacks[cst.OTHER_PLAYER].map((letter) => ALPHABET[letter].score).reduce((acc, x) => acc + x, 0);
        if (reserve.getCount() === 0 && mainRackScore === 0) {
            scores[cst.MAIN_PLAYER] += otherRackScore;
            scores[cst.OTHER_PLAYER] -= otherRackScore;
        } else if (reserve.getCount() === 0 && otherRackScore === 0) {
            scores[cst.OTHER_PLAYER] += mainRackScore;
            scores[cst.MAIN_PLAYER] -= mainRackScore;
        } else {
            scores[cst.MAIN_PLAYER] -= mainRackScore;
            scores[cst.OTHER_PLAYER] -= otherRackScore;
        }
    }

    static createGameSummaryMessage(players: Player[], reserve: Reserve): string {
        const mainLetterList = reserve.letterRacks[cst.MAIN_PLAYER].join('');
        const otherLetterList = reserve.letterRacks[cst.OTHER_PLAYER].join('');
        const summary =
            'Fin de partie - lettres restantes \n' +
            `\n${players[cst.MAIN_PLAYER].name}: ${mainLetterList} \n ` +
            `\n${players[cst.OTHER_PLAYER].name}: ${otherLetterList} \n `;
        return summary;
    }
}
