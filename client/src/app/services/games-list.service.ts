import { Injectable } from '@angular/core';
import { GameParameters } from '@app/classes/game-parameters';

@Injectable({
    providedIn: 'root',
})
export class GamesListService {
    private gamesList: GameParameters[] = [];

    constructor() {}

    addGame(game: GameParameters) {
        this.gamesList.push(game);
    }

    removeGame(id: number) {
        const game = this.gamesList.findIndex((g) => g.ID === id);
        this.gamesList.splice(game, 1);
    }

    getAllGames() {
        return this.gamesList;
    }
}
