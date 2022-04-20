import { Injectable } from '@angular/core';
import * as constants from '@app/constants';
import { faAngleLeft, faAngleRight } from '@fortawesome/free-solid-svg-icons';
@Injectable({
    providedIn: 'root',
})
export class AvatarSelectionService {
    imgChosen: string = constants.imgList[0];
    idx: number = 0;
    faAngleRight = faAngleRight;
    faAngleLeft = faAngleLeft;

    chooseIcon(next: boolean) {
        this.idx = (this.idx + (next ? 1 : constants.MISSING) + constants.NUMBER_ICONS) % constants.NUMBER_ICONS;
        this.imgChosen = constants.imgList[this.idx];
    }
}
