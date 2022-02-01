import { Component, Injectable, Injector, OnInit } from '@angular/core';
import { SkipTurnService } from '@app/services/skip-turn.service';
@Component({
    selector: 'app-infos-box',
    templateUrl: './infos-box.component.html',
    styleUrls: ['./infos-box.component.scss'],
})
@Injectable()
export class InfosBoxComponent implements OnInit {
    constructor(public skipTurn: SkipTurnService) {}

    ngOnInit(): void {}
}
Injector.create({
    providers: [
        { provide: InfosBoxComponent, deps: [SkipTurnService] },
        { provide: SkipTurnService, deps: [] },
    ],
});
