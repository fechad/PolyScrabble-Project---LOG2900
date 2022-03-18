import { Injectable } from '@angular/core';
import { CommandParsing } from '@app/classes/command-parsing';
import { CommunicationService } from '@app/services/communication.service';
import { GameContextService } from '@app/services/game-context.service';
import { take } from 'rxjs/operators';

const COMMAND_INDEX = 0;
const LETTERS_TO_EXCHANGE_INDEX = 1;
const POSITION_BLOCK_INDEX = 1;
const MIN_TYPED_WORD_LENGTH = 1;
const HELP_COMMAND_LENGTH = 1;
const PASS_COMMAND_LENGTH = 1;
const RESERVE_COMMAND_LENGTH = 1;
const POSITION_BLOCK_MIN_LENGTH = 2;
const WORD_TO_PLACE_INDEX = 2;
const EXCHANGE_COMMAND_LENGTH = 2;
const HORIZONTAL_POSITION_2ND_DIGIT_INDEX = 2;
const PLACE_COMMAND_LENGTH = 3;
const POSITION_BLOCK_AVG_LENGTH = 3;
const POSITION_BLOCK_MAX_LENGTH = 4;
const MAX_TYPED_WORD_LENGTH = 7;
const DECIMAL_BASE = 10;
@Injectable({
    providedIn: 'root',
})
export class ChatBoxLogicService {
    commandStructure: string[] = [];
    parsedLetters: string;
    verticalPosition: string;
    horizontalPosition: string;
    placementOrientation: string | undefined;
    help: string[] = [
        '-- Voici ce que vous pouvez faire: --\n' +
            '\n!placer <ligne><colonne>[(h|v)] <letters>\n' +
            'ex: !placer g10v abc placera les lettres\n' +
            'abc verticalement à partir de la position g10\n' +
            '\n!passer permet de passer votre tour\n' +
            '\n!échanger permet changer vos lettres\n' +
            'ex: !échanger abc\n' +
            '\n!réserve : afficher la quantité restante de chaque lettre dans la réserve\n' +
            '\n!indice : obtenir 3 choix de mots à placer\n' +
            '\n-- Voici ce que vous pouvez faire sur le chevalet et le plateau: --\n' +
            '\ncliquer sur une tuile pour la déplacer avec les flèches de votre clavier ou la roulette de votre souris' +
            '\nou taper sur la touche de votre clavier correspondant à la lettre pour la sélectionner\n' +
            '\nfaites un clic droit sur les tuiles pour sélectionner des lettres à échanger\n' +
            '\ncliquer sur une case du plateau pour placer des lettres de votre chevalet horizontalement\n' +
            'en tapant les touches correspondantes du clavier,\n' +
            'cliquer une seconde fois pour placer verticalement\n',
    ];

    constructor(public communicationService: CommunicationService, public gameContextService: GameContextService) {}

    async validateSyntax(textValue: string) {
        if (!CommandParsing.containsIllegalCharacters(textValue.trim()) && textValue.trim() !== '') {
            this.communicationService.sendLocalMessage('Les messages peuvent seulement contenir des caractères textuels ou bien !, ? et *');
            return;
        }
        if (textValue.trim() === '') {
            return;
        }
        this.commandStructure = textValue.split(' ');
        if (this.commandStructure[COMMAND_INDEX][COMMAND_INDEX] === '!') {
            try {
                await this.dispatchCommand(this.commandStructure.length);
            } catch (e: unknown) {
                if (e instanceof Error) {
                    const message = e.message;
                    this.communicationService.sendLocalMessage(message);
                }
            }
        } else {
            this.communicationService.sendMessage(textValue);
        }
    }

    private async dispatchCommand(commandLength: number) {
        const myTurn = await this.gameContextService.isMyTurn().pipe(take(1)).toPromise();
        if (this.gameContextService.state.value.ended) throw new Error(' La partie est terminée !');
        else if (this.commandStructure[COMMAND_INDEX] === '!réserve' && commandLength === RESERVE_COMMAND_LENGTH) this.getReserve();
        else if (this.commandStructure[COMMAND_INDEX] === '!aide' && commandLength === HELP_COMMAND_LENGTH) this.sendHelp();
        else if (!myTurn) throw new Error("Ce n'est pas votre tour");
        else if (this.commandStructure[COMMAND_INDEX] === '!placer' && commandLength === PLACE_COMMAND_LENGTH) {
            this.parsedLetters = CommandParsing.removeAccents(this.commandStructure[WORD_TO_PLACE_INDEX]);
            this.assignPositionSpec(this.commandStructure[POSITION_BLOCK_INDEX]);
            this.place();
        } else if (this.commandStructure[COMMAND_INDEX] === '!échanger' && commandLength === EXCHANGE_COMMAND_LENGTH) {
            this.parsedLetters = CommandParsing.removeAccents(this.commandStructure[LETTERS_TO_EXCHANGE_INDEX]);
            this.exchange();
        } else if (this.commandStructure[COMMAND_INDEX] === '!passer' && commandLength === PASS_COMMAND_LENGTH) this.pass();
        else throw new Error(`La commande ${this.commandStructure[COMMAND_INDEX]} ne respecte pas la syntaxe demandée`);
    }

    private sendHelp() {
        for (const message of this.help) {
            this.communicationService.sendCommandMessage(message);
        }
    }

    private place() {
        this.gameContextService.attemptTempRackUpdate(this.parsedLetters);
        if (!CommandParsing.isPlayableWord(this.parsedLetters)) throw new Error("Un des caractère n'est pas valide, les caractères valides sont a-z");
        if (!CommandParsing.isValidVerticalPosition(this.verticalPosition))
            throw new Error("La position verticale choisie n'est pas sur la grille de jeu");
        if (!CommandParsing.isValidHorizontalPosition(this.horizontalPosition))
            throw new Error("La position horizontale choisie n'est pas sur la grille de jeu");
        if (this.placementOrientation === undefined) {
            if (this.parsedLetters.length !== MIN_TYPED_WORD_LENGTH)
                throw new Error("L'orientation du placement n'est pas mentionnée alors que le mot a une longeure supérieur à 1");
        } else {
            if (!CommandParsing.isValidOrientation(this.placementOrientation as string))
                throw new Error("L'orientation du placement n'est pas valide");
        }
        const verticalIndex = CommandParsing.getVerticalIndex(this.verticalPosition);
        const horizontalIndex = parseInt(this.horizontalPosition, DECIMAL_BASE) - 1;
        const isHorizontal = CommandParsing.isHorizontalOrientation(this.placementOrientation);
        this.communicationService.place(this.parsedLetters, verticalIndex, horizontalIndex, isHorizontal);
    }

    private exchange() {
        const isInBound = this.parsedLetters.length >= MIN_TYPED_WORD_LENGTH && this.parsedLetters.length <= MAX_TYPED_WORD_LENGTH;
        if (!CommandParsing.areValidCharactersToExchange(this.commandStructure[LETTERS_TO_EXCHANGE_INDEX])) {
            throw new Error("Un des caractère n'est pas valide, les caractères valides sont a-z et *");
        }
        if (isInBound) {
            this.gameContextService.attemptTempRackUpdate(this.parsedLetters);
            this.communicationService.exchange(this.commandStructure[LETTERS_TO_EXCHANGE_INDEX]);
        } else {
            throw new Error("Impossible d'échanger cette quantité de lettres");
        }
    }

    private pass() {
        this.communicationService.switchTurn(false);
    }

    private getReserve() {
        this.communicationService.getReserve();
    }

    private assignPositionSpec(positionBlock: string) {
        this.verticalPosition = positionBlock[0];
        this.horizontalPosition = positionBlock[1];
        this.placementOrientation = undefined;

        switch (positionBlock.length) {
            case POSITION_BLOCK_MIN_LENGTH: {
                break;
            }
            case POSITION_BLOCK_AVG_LENGTH: {
                if (isNaN(+positionBlock[positionBlock.length - 1])) {
                    this.placementOrientation = positionBlock[positionBlock.length - 1];
                } else {
                    this.horizontalPosition += positionBlock[positionBlock.length - 1];
                }
                break;
            }
            case POSITION_BLOCK_MAX_LENGTH: {
                this.horizontalPosition += positionBlock[HORIZONTAL_POSITION_2ND_DIGIT_INDEX];
                this.placementOrientation = positionBlock[positionBlock.length - 1];
                break;
            }
            default: {
                throw new Error('Le coordonnées de positionnement ne respectent pas le format demandé');
            }
        }
    }
}
