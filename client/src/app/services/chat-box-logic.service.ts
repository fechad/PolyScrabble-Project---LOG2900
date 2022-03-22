import { Injectable } from '@angular/core';
import { CommandParsing } from '@app/classes/command-parsing';
import { State } from '@app/classes/room';
import * as cst from '@app/constants';
import { GameContextService, MessageType } from '@app/services/game-context.service';
import { take } from 'rxjs/operators';
import { GridService } from './grid.service';

@Injectable({
    providedIn: 'root',
})
export class ChatBoxLogicService {
    commandStructure: string[] = [];
    parsedLetters: string;
    verticalPosition: string;
    horizontalPosition: string;
    placementOrientation: string | undefined;

    constructor(public gameContextService: GameContextService, private gridService: GridService) {}

    async validateSyntax(textValue: string) {
        if (!CommandParsing.containsIllegalCharacters(textValue.trim()) && textValue.trim() !== '')
            return this.gameContextService.addMessage(
                'Les messages peuvent seulement contenir des caractères textuels ou bien !, ? et *',
                MessageType.Local,
            );
        if (textValue.trim() === '') return;
        this.commandStructure = textValue.split(' ');
        if (this.commandStructure[cst.COMMAND_INDEX][cst.COMMAND_INDEX] === '!') {
            try {
                await this.dispatchCommand(this.commandStructure.length);
            } catch (e: unknown) {
                if (e instanceof Error) {
                    const message = e.message;
                    this.gameContextService.addMessage(message, MessageType.Local);
                }
            }
        } else {
            this.gameContextService.addMessage(textValue);
        }
    }

    private async dispatchCommand(commandLength: number) {
        const myTurn = await this.gameContextService.isMyTurn().pipe(take(1)).toPromise();
        if (this.gameContextService.state.value.state !== State.Started) throw new Error(' La partie est terminée !');
        else if (this.commandStructure[cst.COMMAND_INDEX] === '!réserve' && commandLength === cst.RESERVE_COMMAND_LENGTH) this.getReserve();
        else if (this.commandStructure[cst.COMMAND_INDEX] === '!aide' && commandLength === cst.HELP_COMMAND_LENGTH) this.sendHelp();
        else if (!myTurn) throw new Error("Ce n'est pas votre tour");
        else if (this.commandStructure[cst.COMMAND_INDEX] === '!indice' && commandLength === cst.HINT_COMMAND_LENGTH) this.hint();
        else if (this.commandStructure[cst.COMMAND_INDEX] === '!placer' && commandLength === cst.PLACE_COMMAND_LENGTH) {
            this.parsedLetters = CommandParsing.removeAccents(this.commandStructure[cst.WORD_TO_PLACE_INDEX]);
            this.assignPositionSpec(this.commandStructure[cst.POSITION_BLOCK_INDEX]);
            this.place();
        } else if (this.commandStructure[cst.COMMAND_INDEX] === '!échanger' && commandLength === cst.EXCHANGE_COMMAND_LENGTH) {
            this.parsedLetters = CommandParsing.removeAccents(this.commandStructure[cst.LETTERS_TO_EXCHANGE_INDEX]);
            this.exchange();
        } else if (this.commandStructure[cst.COMMAND_INDEX] === '!passer' && commandLength === cst.PASS_COMMAND_LENGTH) this.pass();
        else throw new Error(`La commande ${this.commandStructure[cst.COMMAND_INDEX]} ne respecte pas la syntaxe demandée`);
    }

    private sendHelp() {
        this.gameContextService.addMessage(cst.HELP_MESSAGE, MessageType.Command);
    }

    private place() {
        this.gameContextService.attemptTempRackUpdate(this.parsedLetters);
        if (!CommandParsing.isPlayableWord(this.parsedLetters)) throw new Error("Un des caractère n'est pas valide, les caractères valides sont a-z");
        if (!CommandParsing.isValidVerticalPosition(this.verticalPosition))
            throw new Error("La position verticale choisie n'est pas sur la grille de jeu");
        if (!CommandParsing.isValidHorizontalPosition(this.horizontalPosition))
            throw new Error("La position horizontale choisie n'est pas sur la grille de jeu");
        if (this.placementOrientation === undefined) {
            if (this.parsedLetters.length !== cst.MIN_TYPED_WORD_LENGTH)
                throw new Error("L'orientation du placement n'est pas mentionnée alors que le mot a une longeure supérieur à 1");
        } else if (!CommandParsing.isValidOrientation(this.placementOrientation as string))
            throw new Error("L'orientation du placement n'est pas valide");
        const verticalIndex = CommandParsing.getVerticalIndex(this.verticalPosition);
        const horizontalIndex = parseInt(this.horizontalPosition, cst.DECIMAL_BASE) - 1;
        const isHorizontal = CommandParsing.isHorizontalOrientation(this.placementOrientation);
        this.gameContextService.place(this.parsedLetters, verticalIndex, horizontalIndex, isHorizontal);
        this.gridService.tempUpdateBoard(this.parsedLetters, verticalIndex, horizontalIndex, isHorizontal)
    }

    private exchange() {
        const isInBound = this.parsedLetters.length >= cst.MIN_TYPED_WORD_LENGTH && this.parsedLetters.length <= cst.MAX_TYPED_WORD_LENGTH;
        if (!CommandParsing.areValidCharactersToExchange(this.commandStructure[cst.LETTERS_TO_EXCHANGE_INDEX]))
            throw new Error("Un des caractère n'est pas valide, les caractères valides sont a-z et *");
        if (!isInBound) throw new Error("Impossible d'échanger cette quantité de lettres");

        this.gameContextService.attemptTempRackUpdate(this.parsedLetters);
        this.gameContextService.exchange(this.commandStructure[cst.LETTERS_TO_EXCHANGE_INDEX]);
    }

    private pass() {
        this.gameContextService.switchTurn(false);
    }

    private hint() {
        this.gameContextService.hint();
    }

    private getReserve() {
        this.gameContextService.getReserve();
    }

    private assignPositionSpec(positionBlock: string) {
        this.verticalPosition = positionBlock[0];
        this.horizontalPosition = positionBlock[1];
        this.placementOrientation = undefined;

        switch (positionBlock.length) {
            case cst.POSITION_BLOCK_MIN_LENGTH: {
                break;
            }
            case cst.POSITION_BLOCK_AVG_LENGTH: {
                if (isNaN(+positionBlock[positionBlock.length - 1])) {
                    this.placementOrientation = positionBlock[positionBlock.length - 1];
                } else {
                    this.horizontalPosition += positionBlock[positionBlock.length - 1];
                }
                break;
            }
            case cst.POSITION_BLOCK_MAX_LENGTH: {
                this.horizontalPosition += positionBlock[cst.HORIZONTAL_POSITION_2ND_DIGIT_INDEX];
                this.placementOrientation = positionBlock[positionBlock.length - 1];
                break;
            }
            default: {
                throw new Error('Le coordonnées de positionnement ne respectent pas le format demandé');
            }
        }
    }
}
