import { letters } from '@app/services/Alphabet';

describe('Alphabet', () => {
    const letterList = letters;
    it('letters should contain 7 elements when calld', () => {
        expect(letterList).toHaveSize(7);
    });
    it('letters should should contain at least a different letter', () => {
        expect(letterList.every((letter, i, list) => letter === list[0])).toBeFalse();
    });
});
