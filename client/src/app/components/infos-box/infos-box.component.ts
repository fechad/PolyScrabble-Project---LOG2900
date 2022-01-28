import { Component, OnInit } from '@angular/core';
import { SkipTurn } from '@app/services/skipTurn.service';
@Component({
    selector: 'app-infos-box',
    templateUrl: './infos-box.component.html',
    styleUrls: ['./infos-box.component.scss'],
})
export class InfosBoxComponent implements OnInit {
    constructor(public skipTurn: SkipTurn) {}

    ngOnInit(): void {}
}
