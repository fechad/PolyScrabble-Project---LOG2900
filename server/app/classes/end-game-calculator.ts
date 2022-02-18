import { MAIN_PLAYER, OTHER_PLAYER } from '@app/classes/game';
import { Reserve } from '@app/classes/reserve';
import { Player } from '@app/classes/room';

export class EndGameCalculator {
    static calculateFinalScores(scores: number[], reserve: Reserve): number[] {
        let mainRackScore = reserve.letterRacks[MAIN_PLAYER].map((letter) => letter.score).reduce((acc, x) => acc + x);
        let otherRackScore = reserve.letterRacks[OTHER_PLAYER].map((letter) => letter.score).reduce((acc, x) => acc + x);
        if (reserve.getCount() !== 0) {
            scores[MAIN_PLAYER] -= mainRackScore;
            scores[OTHER_PLAYER] -= otherRackScore;
        } else if (mainRackScore === 0) {
            scores[MAIN_PLAYER] += otherRackScore;
            scores[OTHER_PLAYER] -= otherRackScore;
        } else if (otherRackScore === 0) {
            scores[OTHER_PLAYER] += mainRackScore;
            scores[MAIN_PLAYER] -= mainRackScore;
        }
        return scores;
    }
    
    static createGameSummaryMessage(players: Player[], reserve: Reserve): string {
        let mainLetterList = reserve.letterRacks[MAIN_PLAYER].map(letter => letter.name).join('');
        let otherLetterList = reserve.letterRacks[OTHER_PLAYER].map(letter => letter.name).join('');
        const summary =
            'Fin de partie - lettres restantes \n' +
            `\n${players[MAIN_PLAYER].name}: ${mainLetterList} \n ` +
            `\n${players[OTHER_PLAYER].name}: ${otherLetterList} \n `;
        return summary;
    }
}
