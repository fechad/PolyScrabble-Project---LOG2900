import { ALPHABET } from '@app/alphabet-template';
import { EndGameCalculator } from '@app/classes/end-game-calculator';
import * as cst from '@app/constants';
import { GameHistory, GameMode, PlayerGameInfo } from '@app/game-history';
import { Message } from '@app/message';
import { DictionnaryService } from '@app/services/dictionnary.service';
import { GameHistoryService } from '@app/services/game-history-service';
import { EventEmitter } from 'events';
import { Board } from './board';
import { Objective, OBJECTIVE_TYPES } from './objectives';
import { Difficulty } from './parameters';
import { PlacementOption } from './placement-option';
import { Position } from './position';
import { Reserve } from './reserve';
import { Player, PlayerId, Room, State } from './room';
import { VirtualPlayer } from './virtual-player';
import { WordGetter } from './word-getter';

/* eslint-disable max-lines */

export type GameId = number;
type Tile = Letter | undefined;

type PlayerInfo = {
    info: Player;
    score: number;
    rackCount: number;
};

type Letter = {
    name: string;
    score: number;
};

type GameState = {
    players: PlayerInfo[];
    reserveCount: number;
    board: Tile[][];
    turn?: PlayerId;
    state: State;
    winner?: PlayerId;
};

type ObjectiveInfo = { text: string; score: number; isPublic: boolean; available: boolean; mine: boolean };
type Objectives = { objective: Objective; player?: PlayerId; doneByPlayer?: PlayerId }[];

export class Game {
    readonly eventEmitter: EventEmitter;
    readonly reserve: Reserve;
    readonly board: Board;
    readonly messages: Message[] = [];
    readonly scores: number[] = [0, 0];
    readonly players: Player[];
    private isPlayer0Turn: boolean;
    private skipCounter: number;
    private winner: PlayerId | undefined = undefined;
    private timeout: NodeJS.Timeout | undefined = undefined;
    private readonly wordGetter;
    private gameHistory: GameHistory;
    private objectives: Objectives | undefined;
    private startTime: Date;

    constructor(
        readonly room: Room,
        private readonly dictionnaryService: DictionnaryService,
        private readonly gameHistoryService: GameHistoryService,
    ) {
        if (room.getOtherPlayer() === undefined) throw new Error('Tried to create game with only one player');
        this.players = [room.mainPlayer, room.getOtherPlayer() as Player];
        this.board = new Board();
        this.reserve = new Reserve();
        this.eventEmitter = new EventEmitter();
        this.timeout = setTimeout(() => this.timeoutHandler(), this.room.parameters.timer * cst.SEC_TO_MS);
        this.isPlayer0Turn = Math.random() >= cst.PLAYER_0_TURN_PROBABILITY;
        this.skipCounter = 0;
        this.wordGetter = new WordGetter(this.board);
        const firstPlayerInfo: PlayerGameInfo = { name: this.players[cst.MAIN_PLAYER].name, pointsScored: undefined, replacedBy: null };
        const secondPlayerInfo: PlayerGameInfo = { name: this.players[cst.OTHER_PLAYER].name, pointsScored: undefined, replacedBy: null };
        const gameMode = this.room.parameters.log2990 ? GameMode.Log2990 : GameMode.Classic;
        this.startTime = new Date();
        this.gameHistory = {
            startTime: this.startTime.toLocaleString(),
            length: undefined,
            firstPlayer: firstPlayerInfo,
            secondPlayer: secondPlayerInfo,
            mode: gameMode,
        };
        if (room.parameters.log2990) {
            this.objectives = Game.genRandomObjectives(this.players[cst.MAIN_PLAYER].id, this.players[cst.OTHER_PLAYER].id);
        }
    }

    // Taken from https://stackoverflow.com/a/12646864/4950659
    private static shuffleArray<T>(array: T[]): T[] {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    private static genRandomObjectives(playerOne: PlayerId, playerTwo: PlayerId): Objectives {
        const players = [undefined, undefined, playerOne, playerTwo];
        return this.shuffleArray(OBJECTIVE_TYPES.slice())
            .slice(0, players.length)
            .map((objectiveType, i) => ({ objective: new objectiveType(), player: players[i] }));
    }

    private static createCommand(letters: string[], pos: Position, isHorizontal?: boolean): string {
        const columnOnBoard = pos.col + 1;
        const rowOnBoard = String.fromCharCode(pos.row + cst.ASCII_LOWERCASE_A);
        const orientation = isHorizontal !== null ? (isHorizontal ? 'h' : 'v') : '';
        const position = rowOnBoard + columnOnBoard + orientation;
        return `!placer ${position} ${letters.join('')}`;
    }

    get id(): number {
        return this.room.id;
    }

    sendState() {
        const state: GameState = {
            players: [this.getPlayerInfo(this.players[cst.MAIN_PLAYER].id), this.getPlayerInfo(this.players[cst.OTHER_PLAYER].id)],
            reserveCount: this.reserve.getCount(),
            board: this.board.getState().map((row) => row.map((tile) => (tile ? { name: tile, score: ALPHABET[tile].score } : undefined))),
            turn: this.room.getState() === State.Started ? this.getCurrentPlayer().id : undefined,
            state: this.room.getState(),
            winner: this.winner,
        };
        this.eventEmitter.emit('state', state);
        this.players.forEach((player, playerIdx) => {
            this.eventEmitter.emit('objectives', player.id, this.objectivesInfo(player.id));
            this.eventEmitter.emit(
                'rack',
                player.id,
                this.reserve.letterRacks[playerIdx].map((letter) => ({ name: letter, score: ALPHABET[letter].score })),
            );
        });
    }

    getPlayerInfo(id: PlayerId): PlayerInfo {
        const playerIdx = this.players.findIndex((player) => player.id === id);
        if (playerIdx === cst.INVALID_INDEX) throw new Error('Not one of the players');
        return { info: this.players[playerIdx], score: this.scores[playerIdx], rackCount: this.reserve.letterRacks[playerIdx].length };
    }

    message(message: Message) {
        this.messages.push(message);
        this.eventEmitter.emit('message', message);
    }

    async placeLetters(playerId: PlayerId, letters: string[], pos: Position, isHorizontal?: boolean) {
        if (!this.checkTurn(playerId)) return;
        console.log(
            `User ${playerId} made placement of word ${letters} at position ${JSON.stringify(pos)} in direction ${
                isHorizontal ? 'horizontal' : 'vertical'
            }`,
        );
        const playerIndex = this.getPlayerIndex(this.getCurrentPlayer().id);
        const player = this.getCurrentPlayer();
        if (this.timeout !== undefined) clearTimeout(this.timeout);
        this.timeout = undefined;
        try {
            if (!pos.isInBound()) throw new Error('Placement invalide: hors de la grille');
            isHorizontal ??= this.board.isInContact(pos, false);
            const triedPlacement = PlacementOption.newPlacement(this.board, pos, isHorizontal, letters);
            const words = this.wordGetter.getWords(triedPlacement);
            if (!words.every((wordOption) => this.dictionnaryService.isValidWord(this.room.parameters.dictionnary, wordOption.word)))
                throw new Error('Un des mots crees ne fait pas partie du dictionnaire ' + words.map((word) => word.word).join(' '));

            await new Promise((resolve) => {
                setTimeout(() => {
                    resolve(null);
                }, cst.BOARD_PLACEMENT_DELAY);
            });

            this.reserve.updateReserve(letters, this.isPlayer0Turn, false);

            this.scores[playerIndex] += words.reduce((sum, word) => (sum += word.score), 0);
            if (letters.length === cst.WORD_LENGTH_BONUS) this.scores[playerIndex] += cst.BONUS_POINTS;
            if (this.objectives) {
                const accomplishedObjectives = this.objectives
                    .filter((objective) => !objective.player || objective.player === playerId || !objective.doneByPlayer)
                    .filter((objective) =>
                        objective.objective.isAccomplished(
                            triedPlacement,
                            words.map((word) => word.word),
                        ),
                    );
                for (const objective of accomplishedObjectives) {
                    console.log(`Player ${playerId} accomplished objective '${objective.objective.description}'`);
                    this.scores[playerIndex] += objective.objective.points;
                    objective.doneByPlayer = playerId;
                }
            }

            this.board.place(triedPlacement.newLetters);

            const validMessage = player.name + ' : ' + Game.createCommand(letters, pos, isHorizontal);
            this.eventEmitter.emit('message', { text: validMessage, emitter: 'command' } as Message);
        } catch (e) {
            this.eventEmitter.emit('message', { text: player.name + ' a fait un mauvais placement', emitter: 'command' } as Message);
            this.eventEmitter.emit('game-error', player.id, e.message);
        }
        this.nextTurn(false);
        if (this.reserve.getCount() === 0 && this.emptiedRack()) {
            this.endGame();
        }
        this.sendState();
    }

    emptiedRack(): boolean {
        return this.reserve.isPlayerRackEmpty(cst.MAIN_PLAYER) || this.reserve.isPlayerRackEmpty(cst.OTHER_PLAYER);
    }

    matchRack(rack: string[]) {
        this.reserve.matchRack(rack, this.isPlayer0Turn);
    }

    getCurrentPlayer(): Player {
        const playerIndex = this.isPlayer0Turn ? cst.MAIN_PLAYER : cst.OTHER_PLAYER;
        return this.players[playerIndex];
    }

    changeLetters(letters: string[], playerId: PlayerId) {
        if (!this.checkTurn(playerId)) return;
        if (
            this.reserve.getCount() >= letters.length &&
            (this.getCurrentPlayer().virtual || this.reserve.getCount() > cst.MINIMUM_EXCHANGE_RESERVE_COUNT)
        ) {
            this.reserve.updateReserve(letters, this.isPlayer0Turn, true);
            let validMessage = 'Vous avez échangé les lettres:  ' + letters;
            this.eventEmitter.emit('valid-exchange', playerId, validMessage);
            validMessage = this.getCurrentPlayer().name + ' a échangé ' + letters.length + ' lettres';
            const opponentId = this.getPlayerId(false);
            this.eventEmitter.emit('valid-exchange', opponentId, validMessage);
            this.nextTurn(false);
        } else {
            this.eventEmitter.emit('game-error', playerId, new Error('La réserve est trop petite pour y échanger des lettres').message);
        }
        this.sendState();
    }

    hint(playerId: PlayerId) {
        if (this.checkTurn(playerId)) {
            const virtual = new VirtualPlayer(Difficulty.Expert, this, this.dictionnaryService.dictionnaries[this.room.parameters.dictionnary].trie);
            const player = this.getPlayerIndex(playerId);
            const options = virtual.chooseWords(this.reserve.letterRacks[player]).slice(0, 3);
            let hintMessage =
                options.length === 0
                    ? 'Aucun placement possible'
                    : options.length < cst.HINT_NUMBER_OPTIONS
                    ? 'Indices (moins de 3 placements possibles):\n'
                    : 'Indices:\n';
            hintMessage += options
                .map(
                    (opt, i) =>
                        ` ${i + 1}. ${Game.createCommand(
                            opt.placement.newLetters.map((letter) => letter.letter),
                            opt.placement.newLetters[0].position,
                            opt.placement.isHorizontal,
                        )}`,
                )
                .join('\n');
            this.eventEmitter.emit('valid-exchange', playerId, hintMessage);
        }
    }

    skipTurn(playerId: PlayerId) {
        if (this.checkTurn(playerId)) {
            const validMessage = this.getCurrentPlayer().name + ' a passé son tour !';
            this.eventEmitter.emit('message', { text: validMessage, emitter: 'command' } as Message);
            this.nextTurn(true);
            this.sendState();
        }
    }

    showReserveContent(playerId: PlayerId) {
        this.eventEmitter.emit('reserve-content', playerId, this.reserve.getContent());
    }

    forfeit(idLoser: PlayerId) {
        if (this.room.getState() !== State.Started) return;
        if (this.players.every((player) => player.id !== idLoser)) return;
        if (this.players.some((player) => player.virtual)) {
            this.room.end(true);
            this.winner = idLoser === this.players[cst.MAIN_PLAYER].id ? this.players[cst.OTHER_PLAYER].id : this.players[cst.MAIN_PLAYER].id;
            this.completeGameHistory();
        } else {
            const loserIsMainPlayer = idLoser === this.players[cst.MAIN_PLAYER].id;
            const idxPlayerToReplace = this.getPlayerIndex(idLoser);
            const playerReplaced = loserIsMainPlayer ? this.gameHistory.firstPlayer : this.gameHistory.secondPlayer;
            this.replaceByVirtualPlayer(idxPlayerToReplace);
            const replacementPlayer = this.players[idxPlayerToReplace].name;
            playerReplaced.replacedBy = replacementPlayer;
            const message = `Votre adversaire ${playerReplaced.name} a abandonné et sera remplacé par ${replacementPlayer}`;
            this.eventEmitter.emit('message', { text: message, emitter: 'command' } as Message);
        }
        this.sendState();
    }

    getWinner(): string | undefined {
        if (this.scores[cst.MAIN_PLAYER] > this.scores[cst.OTHER_PLAYER]) return this.players[cst.MAIN_PLAYER].id;
        else if (this.scores[cst.MAIN_PLAYER] < this.scores[cst.OTHER_PLAYER]) return this.players[cst.OTHER_PLAYER].id;
        return undefined;
    }
    
    getPlayerIndex(playerId: PlayerId) {
        return this.players[cst.MAIN_PLAYER].id === playerId ? cst.MAIN_PLAYER : cst.OTHER_PLAYER;
    }

    endGame() {
        EndGameCalculator.calculateFinalScores(this.scores, this.reserve);
        this.room.end(false);
        this.completeGameHistory();
        this.winner = this.getWinner();
        this.eventEmitter.emit('message', {
            text: EndGameCalculator.createGameSummaryMessage(
                this.players.map((p) => p),
                this.reserve,
            ),
            emitter: 'local',
        } as Message);
    }

    private completeGameHistory() {
        const differenceInMs = new Date().getTime() - this.startTime.getTime();
        const lengthInSeconds = Math.ceil((differenceInMs % cst.MIN_TO_MS) / cst.SEC_TO_MS);
        const lengthInMinutes = Math.floor(differenceInMs / cst.MIN_TO_MS);
        this.gameHistory.length = lengthInMinutes + ' min ' + lengthInSeconds + ' s';
        this.gameHistory.firstPlayer.pointsScored = this.scores[cst.MAIN_PLAYER];
        this.gameHistory.secondPlayer.pointsScored = this.scores[cst.OTHER_PLAYER];
        this.gameHistoryService.addGame(this.gameHistory);
    }

    private objectivesInfo(id: PlayerId): ObjectiveInfo[] {
        return this.objectives
            ? this.objectives
                  .filter((objective) => !objective.player || objective.player === id || objective.doneByPlayer)
                  .map((objective) => ({
                      text: objective.objective.description,
                      score: objective.objective.points,
                      isPublic: !objective.player,
                      available: !objective.doneByPlayer,
                      mine: objective.doneByPlayer === id,
                  }))
            : [];
    }

    private timeoutHandler() {
        this.nextTurn(true);
        this.sendState();
    }

    private nextTurn(userRequest: boolean) {
        this.isPlayer0Turn = !this.isPlayer0Turn;

        this.skipCounter = userRequest ? this.skipCounter + 1 : 0;

        if (this.skipCounter === cst.MAX_SKIP_IN_A_ROW) this.endGame();

        if (this.timeout) clearTimeout(this.timeout);
        if (this.room.getState() === State.Started) {
            this.timeout = setTimeout(() => this.timeoutHandler(), this.room.parameters.timer * cst.SEC_TO_MS);
        } else {
            this.timeout = undefined;
        }
    }

    private replaceByVirtualPlayer(idxPlayerToReplace: number) {
        const listOfNames = ['name1', 'name2', 'name3', 'name4']; // TODO: prendre les vrais eventuellement
        let idxName = Math.floor(Math.random() * listOfNames.length);

        if (this.getPlayerInfo(this.getPlayerId(false)).info.name === listOfNames[idxName]) {
            idxName = (idxName + 1) % listOfNames.length;
        }
        this.players[idxPlayerToReplace].name = listOfNames[idxName];
        this.players[idxPlayerToReplace].virtual = true;
        this.players[idxPlayerToReplace].id = 'VP';
        const vP = new VirtualPlayer(Difficulty.Beginner, this, this.dictionnaryService.dictionnaries[this.room.parameters.dictionnary].trie);
        vP.waitForTurn();
    }

    private getPlayerId(isActivePlayer: boolean) {
        return isActivePlayer === this.isPlayer0Turn ? this.players[cst.MAIN_PLAYER].id : this.players[cst.OTHER_PLAYER].id;
    }

    private checkTurn(playerId: PlayerId) {
        const validTurn = playerId === this.getPlayerId(true);
        if (!validTurn) this.eventEmitter.emit('game-error', playerId, new Error("Ce n'est pas votre tour").message);
        return validTurn;
    }
}
