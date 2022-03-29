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

    chooseIcon(next: boolean) {
        this.idx = (this.idx + (next ? 1 : cst.MISSING) + cst.NUMBER_ICONS) % cst.NUMBER_ICONS;
        this.imgChosen = cst.imgList[this.idx];
    }
}
