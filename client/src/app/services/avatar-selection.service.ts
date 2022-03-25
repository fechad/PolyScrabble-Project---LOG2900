import { Injectable } from '@angular/core';
import * as cst from '@app/constants';
import { faAngleLeft, faAngleRight } from '@fortawesome/free-solid-svg-icons';
@Injectable({
    providedIn: 'root',
})
export class AvatarSelectionService {
    imgChosen: string = cst.imgList[0];
    idx: number = 0;
    faAngleRight = faAngleRight;
    faAngleLeft = faAngleLeft;
    constructor() {}

    chooseIcon(next: boolean) {
        if (next) this.idx++;
        else this.idx--;
        if (this.idx === -1) this.idx = 3;
        this.imgChosen = cst.imgList[this.idx % 4];
    }
}
