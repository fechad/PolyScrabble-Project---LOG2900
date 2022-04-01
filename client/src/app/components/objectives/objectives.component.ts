import { Component, Input, OnInit } from '@angular/core';
import { GameContextService, Objective } from '@app/services/game-context.service';
import { faAngleLeft, faAngleRight, IconDefinition } from '@fortawesome/free-solid-svg-icons';

@Component({
    selector: 'app-objectives',
    templateUrl: './objectives.component.html',
    styleUrls: ['./objectives.component.scss'],
})
export class ObjectivesComponent implements OnInit {
    @Input() isPublic: boolean;

    isOpen: boolean;
    objectives: Objective[];
    headerName: string;
    faAngleLeft: IconDefinition = faAngleLeft;
    faAngleRight: IconDefinition = faAngleRight;

    constructor(readonly gameContext: GameContextService) {
        this.gameContext.objectives.subscribe((newObjectives) => (this.objectives = newObjectives));
        this.isOpen = true;
    }

    ngOnInit() {
        this.headerName = this.isPublic ? 'Objectifs publiques' : 'Objectifs privés';
    }

    showObjectives() {
        this.isOpen = !this.isOpen;
    }
}
