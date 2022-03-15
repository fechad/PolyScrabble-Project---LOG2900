import { AfterViewChecked, Component } from '@angular/core';
import { ChatBoxLogicService } from '@app/services/chat-box-logic.service';
import { CommunicationService } from '@app/services/communication.service';
import { GameContextService } from '@app/services/game-context.service';

@Component({
    selector: 'app-chat-box',
    templateUrl: './chat-box.component.html',
    styleUrls: ['./chat-box.component.scss'],
})
export class ChatBoxComponent implements AfterViewChecked {
    textValue: string = '';
    myId: string | undefined;

    constructor(
        public communicationService: CommunicationService,
        public gameContextService: GameContextService,
        public chatBoxLogicService: ChatBoxLogicService,
    ) {
        this.myId = this.communicationService.getId().value;
    }

    ngAfterViewChecked() {
        this.myId = this.communicationService.getId().value; // needed for 5s reconnexion
    }

    async validateSyntax() {
        await this.chatBoxLogicService.validateSyntax(this.textValue);
        this.textValue = '';
    }
}
