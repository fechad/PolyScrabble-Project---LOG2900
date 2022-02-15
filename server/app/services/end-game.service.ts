import { MAIN_PLAYER, OTHER_PLAYER } from '@app/classes/game';
import { Reserve } from '@app/classes/reserve';
import { Player } from '@app/classes/room';
import { Letter } from '@app/letter';
import { Service } from 'typedi';

@Service()
export class EndGameService {
    mainLetterList: string = '';
    otherLetterList: string = '';

    calculateFinalScores(scores: number[], reserve: Reserve): number[] {
        let mainRackScore = 0;
        let otherRackScore = 0;
        reserve.letterRacks[MAIN_PLAYER].map((letter) => (mainRackScore += letter.score));
        reserve.letterRacks[OTHER_PLAYER].map((letter) => (otherRackScore += letter.score));
        if (reserve.getCount() === 0) {
            if (mainRackScore === 0) {
                scores[MAIN_PLAYER] += otherRackScore;
                scores[OTHER_PLAYER] -= otherRackScore;
                this.updateLetterLists(OTHER_PLAYER, reserve.letterRacks[OTHER_PLAYER]);
            } else if (otherRackScore === 0) {
                scores[OTHER_PLAYER] += mainRackScore;
                scores[MAIN_PLAYER] -= mainRackScore;
                this.updateLetterLists(MAIN_PLAYER, reserve.letterRacks[MAIN_PLAYER]);
            }
        } else {
            scores[MAIN_PLAYER] -= mainRackScore;
            this.updateLetterLists(MAIN_PLAYER, reserve.letterRacks[MAIN_PLAYER]);
            scores[OTHER_PLAYER] -= otherRackScore;
            this.updateLetterLists(OTHER_PLAYER, reserve.letterRacks[OTHER_PLAYER]);
        }
        return scores;
    }
    updateLetterLists(player: number, rack: Letter[]) {
        if (player === MAIN_PLAYER) {
            for (const letter of rack) {
                this.mainLetterList += letter.name;
            }
        } else {
            for (const letter of rack) {
                this.otherLetterList += letter.name;
            }
        }
    }
    createGameSummaryMessage(players: Player[]): string {
        const summary =
            'Fin de partie - lettres restantes \n' +
            `\n${players[MAIN_PLAYER].name}: ${this.mainLetterList} \n ` +
            `\n${players[OTHER_PLAYER].name}: ${this.otherLetterList} \n `;
        return summary;
    }
}
