import { AfterViewChecked, Component, ElementRef, ViewChild } from '@angular/core';
import { CommunicationService } from '@app/services/communication.service';
import { GameContextService } from '@app/services/game-context.service';

const COMMAND_INDEX = 0;
const LETTERS_TO_EXCHANGE_INDEX = 1;
const POSITION_BLOCK_INDEX = 1;
const WORD_TO_PLACE_INDEX = 2;
const POSITION_BLOCK_MAX_LENGTH = 4;
const POSITION_BLOCK_MIN_LENGTH = 3;
const MAX_TYPED_WORD_LENGTH = 7;
const MIN_TYPED_WORD_LENGTH = 1;

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
    textValue: string = '';
    yourMessage: boolean = true;
    syntaxIsValid: boolean = true;
    commandStructure: string[] = [];
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
            this.communicationService.sendLocalMessage('Le message ne peut contenir du caractère non textuelle autre que !, ? et *');
        } else if (this.textValue.trim() !== '') {
            this.commandStructure = this.textValue.split(' ');

            if (this.commandStructure[COMMAND_INDEX][COMMAND_INDEX] === '!') {
                const error = this.validateCommand();
                if (error !== undefined) {
                    this.communicationService.sendLocalMessage(error.message);
                }
            } else {
                this.communicationService.sendMessage(this.textValue);
            }
        }
        this.clearText();
    }

    validateCommand(): Error | undefined {
        if (this.gameContextService.state.value.ended) return new Error(' La partie est terminée !');
        if (this.gameContextService.state.value.turn !== this.communicationService.getId().value) return new Error("Ce n'est pas votre tour");
        if (this.commandStructure[COMMAND_INDEX] === '!placer' && this.commandStructure.length === 3) return this.place();
        if (this.commandStructure[COMMAND_INDEX] === '!échanger' && this.commandStructure.length === 2) return this.exchange();
        if (this.commandStructure[COMMAND_INDEX] === '!passer' && this.commandStructure.length === 1) return this.pass();
        if (this.commandStructure[COMMAND_INDEX] === '!aide' && this.commandStructure.length === 1) {
            this.sendHelp();
            return undefined;
        }
        return new Error(`La commande ${this.commandStructure[COMMAND_INDEX]} n'existe pas`);
    }
    sendHelp() {
        for (const message of this.help) {
            this.communicationService.sendLocalMessage(message);
        }
    }
    place(): Error | undefined {
        let error: Error | undefined;
        if (this.commandStructure[WORD_TO_PLACE_INDEX].match(/[^A-Za-zÀ-ú]/g)) {
            error = new Error("Un des caractère n'est pas valide, les caractères valides sont a-z et *");
        } else if (this.isInRack(this.commandStructure[WORD_TO_PLACE_INDEX])) {
            if (
                this.commandStructure[POSITION_BLOCK_INDEX][0].match(/[a-o]/g) &&
                this.commandStructure[1][this.commandStructure[1].length - 1].match(/[hv]/g)
            ) {
                if (this.commandStructure[POSITION_BLOCK_INDEX].length === POSITION_BLOCK_MIN_LENGTH) {
                    if (this.commandStructure[POSITION_BLOCK_INDEX][1].match(/[1-9]/g)) {
                        this.communicationService.place(this.commandStructure[WORD_TO_PLACE_INDEX], this.commandStructure[POSITION_BLOCK_INDEX]);
                    }
                } else if (
                    this.commandStructure[POSITION_BLOCK_INDEX].length === POSITION_BLOCK_MAX_LENGTH &&
                    this.commandStructure[POSITION_BLOCK_INDEX][1].match(/[1]/g) &&
                    this.commandStructure[POSITION_BLOCK_INDEX][2].match(/[0-5]/g)
                ) {
                    this.communicationService.place(this.commandStructure[WORD_TO_PLACE_INDEX], this.commandStructure[POSITION_BLOCK_INDEX]);
                }
            } else {
                error = new Error("Cette ligne n'existe pas ou l'orientation n'est pas valide");
            }
        } else {
            error = new Error('Ces lettres ne sont pas dans le chevalet');
        }
        return error;
    }
    exchange(): Error | undefined {
        let error: Error | undefined;
        const isInBound =
            this.commandStructure[LETTERS_TO_EXCHANGE_INDEX].length >= MIN_TYPED_WORD_LENGTH &&
            this.commandStructure[LETTERS_TO_EXCHANGE_INDEX].length <= MAX_TYPED_WORD_LENGTH;

        if (this.commandStructure[LETTERS_TO_EXCHANGE_INDEX].match(/[^a-z*]/g)) {
            error = new Error("Un des caractère n'est pas valide, les caractères valides sont a à z et *");
        } else if (this.isInRack(this.commandStructure[LETTERS_TO_EXCHANGE_INDEX]) && isInBound) {
            this.communicationService.exchange(this.commandStructure[LETTERS_TO_EXCHANGE_INDEX]);
        } else {
            error = new Error('Ces lettres ne sont pas dans le chevalet');
        }
        return error;
    }

    pass(): Error | undefined {
        this.communicationService.switchTurn(false);
        return;
    }
    isInRack(word: string) {
        const NOT_FOUND = -1;
        let lettersInRack: string[] = [];
        for (const letter of this.gameContextService.rack.value) {
            lettersInRack = lettersInRack.concat(letter.name);
        }
        for (const letter of word) {
            const index = lettersInRack.findIndex((foundLetter) => {
                return letter === foundLetter.toLowerCase() || foundLetter === '*';
            });
            if (index === NOT_FOUND) return false;
            lettersInRack[index] = lettersInRack[lettersInRack.length - 1];
            lettersInRack.pop();
        }
        return true;
    }

    getLetterExchanged(message: string): number {
        let feedback: string[] = [];
        feedback = message.split(' ');
        return feedback[1].length;
    }
}
