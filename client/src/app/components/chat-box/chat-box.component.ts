import { AfterContentChecked, AfterViewChecked, ChangeDetectorRef, Component } from '@angular/core';
import { ChatBoxLogicService } from '@app/services/chat-box-logic.service';
import { CommunicationService } from '@app/services/communication.service';
import { GameContextService } from '@app/services/game-context.service';

@Component({
    selector: 'app-chat-box',
    templateUrl: './chat-box.component.html',
    styleUrls: ['./chat-box.component.scss'],
})
export class ChatBoxComponent implements AfterViewChecked, AfterContentChecked {
    textValue: string = '';
    myId: string | undefined;

    constructor(
        public communicationService: CommunicationService,
        public gameContextService: GameContextService,
        public chatBoxLogicService: ChatBoxLogicService,
        private detectChanges: ChangeDetectorRef,
    ) {
        this.myId = this.communicationService.getId().value;
    }

    ngAfterContentChecked() {
        this.detectChanges.detectChanges();
    }

    ngAfterViewChecked() {
        this.myId = this.communicationService.getId().value;
    }

    async validateSyntax() {
        await this.chatBoxLogicService.validateSyntax(this.textValue);
        this.textValue = '';
    }
}
