import { MAIN_PLAYER, OTHER_PLAYER } from '@app/classes/game';
import { Reserve } from '@app/classes/reserve';
import { Service } from 'typedi';
@Service()
export class EndGameService {
    letterList0: string = '';
    letterList1: string = '';

    calculateFinalScores(scores: number[], reserve: Reserve): number[] {
        let mainRackScore = 0;
        let otherRackScore = 0;
        reserve.letterRacks[MAIN_PLAYER].map((letter) => (mainRackScore += letter.score));
        reserve.letterRacks[OTHER_PLAYER].map((letter) => (otherRackScore += letter.score));
        if (reserve.getCount() === 0) {
            if (mainRackScore === 0) {
                scores[MAIN_PLAYER] += otherRackScore;
                scores[OTHER_PLAYER] -= otherRackScore;
            } else if (otherRackScore === 0) {
                scores[OTHER_PLAYER] += mainRackScore;
                scores[MAIN_PLAYER] -= mainRackScore;
            }
        } else {
            scores[MAIN_PLAYER] -= mainRackScore;
            scores[OTHER_PLAYER] -= otherRackScore;
        }
        return scores;
    }
    createGameSummaryMessage(): string {
        return '';
    }
}
