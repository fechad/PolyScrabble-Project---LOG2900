import { AfterViewChecked, Component, ElementRef, ViewChild } from '@angular/core';
import { CommandParsing } from '@app/classes/command-parsing';
import { CommunicationService } from '@app/services/communication.service';
import { GameContextService } from '@app/services/game-context.service';

const COMMAND_INDEX = 0;
const LETTERS_TO_EXCHANGE_INDEX = 1;
const POSITION_BLOCK_INDEX = 1;
const WORD_TO_PLACE_INDEX = 2;
const POSITION_BLOCK_MAX_LENGTH = 4;
const POSITION_BLOCK_AVG_LENGTH = 4;
const POSITION_BLOCK_MIN_LENGTH = 2;
const MAX_TYPED_WORD_LENGTH = 7;
const MIN_TYPED_WORD_LENGTH = 1;
const PLACE_COMMAND_LENGTH = 3;
const EXCHANGE_COMMAND_LENGTH = 2;
const HELP_COMMAND_LENGTH = 1;
const PASS_COMMAND_LENGTH = 1;
const HORIZONTAL_POSITION_2ND_DIGIT_INDEX = 2;

@Component({
    selector: 'app-chat-box',
    templateUrl: './chat-box.component.html',
    styleUrls: ['./chat-box.component.scss'],
})
export class ChatBoxComponent implements AfterViewChecked {
    @ViewChild('scroll') private scroller: ElementRef;
    @ViewChild('writingBox') set writingBoxRef(textarea: ElementRef) {
        if (textarea) {
            textarea.nativeElement.focus();
        }
    }
    commandParser: CommandParsing = new CommandParsing();
    textValue: string = '';
    yourMessage: boolean = true;
    syntaxIsValid: boolean = true;
    commandStructure: string[] = [];
    parsedWord: string;
    verticalPosition: string;
    horizontalPosition: string;
    placementOrientation: string;
    help: string[] = [
        'Voici ce que vous pouvez faire: \n' +
            '\n!placer <ligne><colonne>[(h|v)] <letters>\n' +
            'ex: !placer g10v abc placera les lettres\n' +
            'abc verticalement à partir de la position g10\n' +
            '\n!passer permet de pass votre tour\n' +
            '\n!échanger permet changer vos lettres\n' +
            'ex: !échanger abc',
    ];
    myId: string | undefined;

    constructor(public communicationService: CommunicationService, public gameContextService: GameContextService) {
        this.myId = this.communicationService.getId().value;
    }
    ngAfterViewChecked() {
        this.scrollToBottom();
    }

    clearText() {
        this.textValue = '';
    }

    scrollToBottom() {
        this.scroller.nativeElement.scrollTop = this.scroller.nativeElement.scrollHeight;
    }
    validateSyntax() {
        if (!this.textValue.trim().match(/[A-Za-zÀ-ú0-9*!?]/g) && this.textValue.trim() !== '') {
            this.communicationService.sendLocalMessage('Les messages peuvent seulement contenir des caractères textuels ou bien !, ? et *');
        } else if (this.textValue.trim() !== '') {
            this.commandStructure = this.textValue.split(' ');
            if (this.commandStructure[COMMAND_INDEX][COMMAND_INDEX] === '!') {
                try {
                    this.dispatchCommand(this.commandStructure.length);
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                } catch (e: any) {
                    const message = e.message;
                    this.communicationService.sendLocalMessage(message);
                }
            } else {
                this.communicationService.sendMessage(this.textValue);
            }
        }
        this.clearText();
    }

    dispatchCommand(commandLength: number) {
        if (this.communicationService.congratulations !== undefined) throw new Error(' La partie est terminée !');
        else if (!this.gameContextService.isMyTurn.value) throw new Error("Ce n'est pas votre tour");
        else if (this.commandStructure[COMMAND_INDEX] === '!placer' && commandLength === PLACE_COMMAND_LENGTH) {
            this.parsedWord = this.commandParser.removeAccents(this.commandStructure[WORD_TO_PLACE_INDEX]);
            this.assignPositionSpec(this.commandStructure[POSITION_BLOCK_INDEX]);
            this.place();
        } else if (this.commandStructure[COMMAND_INDEX] === '!échanger' && commandLength === EXCHANGE_COMMAND_LENGTH) this.exchange();
        else if (this.commandStructure[COMMAND_INDEX] === '!passer' && commandLength === PASS_COMMAND_LENGTH) this.pass();
        else if (this.commandStructure[COMMAND_INDEX] === '!aide' && commandLength === HELP_COMMAND_LENGTH) this.sendHelp();
        else throw new Error(`La commande ${this.commandStructure[COMMAND_INDEX]} ne respecte pas la syntaxe demandée`);
    }

    sendHelp() {
        for (const message of this.help) {
            this.communicationService.sendLocalMessage(message);
        }
    }

    place() {
        if (this.commandStructure[WORD_TO_PLACE_INDEX].match(/[^A-Za-zÀ-ú]/g)) {
            throw new Error("Un des caractère n'est pas valide, les caractères valides sont a-z");
        } else {
            if (this.isInRack(this.parsedWord)) {
                if (
                    this.commandParser.isValidVerticalPosition(this.verticalPosition) &&
                    (this.commandParser.isValidOrientation(this.placementOrientation) || this.parsedWord.length === 1)
                ) {
                    if (
                        this.commandStructure[POSITION_BLOCK_INDEX].length === POSITION_BLOCK_MIN_LENGTH ||
                        (this.commandStructure[POSITION_BLOCK_INDEX].length === 2 && this.commandStructure[WORD_TO_PLACE_INDEX].length === 1)
                    ) {
                        if (this.commandStructure[POSITION_BLOCK_INDEX][1].match(/[1-9]/g)) {
                            this.communicationService.place(this.commandStructure[WORD_TO_PLACE_INDEX], this.commandStructure[POSITION_BLOCK_INDEX]);
                        }
                    } else if (
                        (this.commandStructure[POSITION_BLOCK_INDEX].length === POSITION_BLOCK_MAX_LENGTH ||
                            (this.commandStructure[POSITION_BLOCK_INDEX].length === 3 && this.commandStructure[WORD_TO_PLACE_INDEX].length === 1)) &&
                        this.commandStructure[POSITION_BLOCK_INDEX][1].match(/[1]/g) &&
                        this.commandStructure[POSITION_BLOCK_INDEX][2].match(/[0-5]/g)
                    ) {
                        this.communicationService.place(this.commandStructure[WORD_TO_PLACE_INDEX], this.commandStructure[POSITION_BLOCK_INDEX]);
                    }
                } else {
                    throw new Error("Cette ligne n'existe pas ou l'orientation n'est pas valide");
                }
            } else {
                throw new Error('Ces lettres ne sont pas dans le chevalet');
            }
        }
    }

    exchange() {
        const isInBound =
            this.commandStructure[LETTERS_TO_EXCHANGE_INDEX].length >= MIN_TYPED_WORD_LENGTH &&
            this.commandStructure[LETTERS_TO_EXCHANGE_INDEX].length <= MAX_TYPED_WORD_LENGTH;

        if (this.commandStructure[LETTERS_TO_EXCHANGE_INDEX].match(/[^a-z*]/g)) {
            throw new Error("Un des caractère n'est pas valide, les caractères valides sont a à z et *");
        } else if (this.isInRack(this.commandStructure[LETTERS_TO_EXCHANGE_INDEX]) && isInBound) {
            this.communicationService.exchange(this.commandStructure[LETTERS_TO_EXCHANGE_INDEX]);
        } else {
            throw new Error('Ces lettres ne sont pas dans le chevalet');
        }
    }

    pass() {
        this.communicationService.switchTurn(false);
    }

    isInRack(word: string) {
        return this.gameContextService.isInMyRack(word);
    }

    getLetterExchanged(message: string): number {
        let feedback: string[] = [];
        feedback = message.split(' ');
        return feedback[1].length;
    }

    private assignPositionSpec(positionBlock: string) {
        this.verticalPosition = positionBlock[0];
        this.horizontalPosition = positionBlock[1];

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
                throw new Error('Le coordonnées de positionnement sont invalides');
            }
        }
    }
}
