import { letters } from '@app/services/alphabet';

const REG_SIZE = 7;
describe('Alphabet', () => {
    const letterList = letters;
    it('letters should contain 7 elements when called', () => {
        expect(letterList).toHaveSize(REG_SIZE);
    });
    it('letters should should contain at least a different letter', () => {
        expect(letterList.every((letter, i, list) => letter === list[0])).toBeFalse();
    });
});
