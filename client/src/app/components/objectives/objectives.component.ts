import { Component, Input } from '@angular/core';
import { Objective } from '@app/services/game-context.service';
import { faAngleLeft, faAngleRight, IconDefinition } from '@fortawesome/free-solid-svg-icons';

@Component({
    selector: 'app-objectives',
    templateUrl: './objectives.component.html',
    styleUrls: ['./objectives.component.scss'],
})
export class ObjectivesComponent {
    @Input() headerName: string;
    @Input() objectives: Objective[];

    isOpen: boolean = true;
    faAngleLeft: IconDefinition = faAngleLeft;
    faAngleRight: IconDefinition = faAngleRight;

    showObjectives() {
        this.isOpen = !this.isOpen;
    }
}
