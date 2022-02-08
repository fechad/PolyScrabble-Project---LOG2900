import { expect } from 'chai';
import { assert } from "console";
import { Board } from "./board";

const BOARD_LENGTH = 15;

describe('Board', () => {
    let board: Board;

    beforeEach(() => {
        board = new Board();
    });

    it('should create 165 tiles', (done) => {
        const expectedCount = BOARD_LENGTH * BOARD_LENGTH;
        assert(board['board'] !== undefined);
        let count = 0;
        board['board'].forEach((row) => {
            row.forEach((tile) => {
                if(tile !== undefined) count++;
            });
        });
        expect(count).equal(expectedCount);
        done();
    });

    it('should add a list of multipliers on the board', (done) => {
        const gameBoard = board['board'];
        //let multiplierList = [[1, 2], [3, 4], [5, 6]];

        let testRef = [0, 0, 1, 3];
        assert(gameBoard[testRef[0]][testRef[1]].multiplier === testRef[2]);
        assert(gameBoard[testRef[0]][testRef[1]].wordMultiplier === testRef[3]);

        testRef = [1, 13, 1, 2];
        assert(gameBoard[testRef[0]][testRef[1]].multiplier === testRef[2]);
        assert(gameBoard[testRef[0]][testRef[1]].wordMultiplier === testRef[3]);

        testRef = [5, 1, 3, 1];
        assert(gameBoard[testRef[0]][testRef[1]].multiplier === testRef[2]);
        assert(gameBoard[testRef[0]][testRef[1]].wordMultiplier === testRef[3]);

        testRef = [0, 3, 2, 1];
        assert(gameBoard[testRef[0]][testRef[1]].multiplier === testRef[2]);
        assert(gameBoard[testRef[0]][testRef[1]].wordMultiplier === testRef[3]);

        testRef = [2, 4, 1, 1];
        assert(gameBoard[testRef[0]][testRef[1]].multiplier === testRef[2]);
        assert(gameBoard[testRef[0]][testRef[1]].wordMultiplier === testRef[3]);
        done();
    });

    it('should have all type of multipliers', (done) => {
        const gameBoard = board['board'];
        let testRef = [0, 0, 1, 3];
        assert(gameBoard[testRef[0]][testRef[1]].multiplier === testRef[2]);
        assert(gameBoard[testRef[0]][testRef[1]].wordMultiplier === testRef[3]);

        testRef = [1, 13, 1, 2];
        assert(gameBoard[testRef[0]][testRef[1]].multiplier === testRef[2]);
        assert(gameBoard[testRef[0]][testRef[1]].wordMultiplier === testRef[3]);

        testRef = [5, 1, 3, 1];
        assert(gameBoard[testRef[0]][testRef[1]].multiplier === testRef[2]);
        assert(gameBoard[testRef[0]][testRef[1]].wordMultiplier === testRef[3]);

        testRef = [0, 3, 2, 1];
        assert(gameBoard[testRef[0]][testRef[1]].multiplier === testRef[2]);
        assert(gameBoard[testRef[0]][testRef[1]].wordMultiplier === testRef[3]);

        testRef = [2, 4, 1, 1];
        assert(gameBoard[testRef[0]][testRef[1]].multiplier === testRef[2]);
        assert(gameBoard[testRef[0]][testRef[1]].wordMultiplier === testRef[3]);
        done();
    });

    it('should separate the position of the word placement', (done) => {
        let positionArrayExpected = ['a', '7', 'h'];
        let position = 'a7h';
        let positionResult = board['separatePosition'](position);
        expect(positionResult[0]).to.be.equal(positionArrayExpected[0]);
        expect(positionResult[1]).to.be.equal(positionArrayExpected[1]);
        expect(positionResult[2]).to.be.equal(positionArrayExpected[2]);

        positionArrayExpected = ['o', '15', 'v'];
        position = 'o15v';
        positionResult = board['separatePosition'](position);
        expect(positionResult[0]).to.be.equal(positionArrayExpected[0]);
        expect(positionResult[1]).to.be.equal(positionArrayExpected[1]);
        expect(positionResult[2]).to.be.equal(positionArrayExpected[2]);
        done();
    });

    it('should validate valid positions', (done) => {
        let positionArray = ['g', '12', 'h'];
        let result = board['validatePositionSyntax'](positionArray);
        assert(result);

        positionArray = ['c', '9', 'v'];
        result = board['validatePositionSyntax'](positionArray);
        assert(result);
        done();
    });


    it('should not let positions out of bound or invalid orientation in the string', (done) => {
        let positionArray = ['v', '12', 'h'];
        let result = board['validatePositionSyntax'](positionArray);
        assert(!result);

        positionArray = ['c', '18', 'v'];
        result = board['validatePositionSyntax'](positionArray);
        assert(!result);

        positionArray = ['e', '9', 'k'];
        result = board['validatePositionSyntax'](positionArray);
        assert(!result);
        done();
    });

    it('should validate if word is inside the board', (done) => {
        let word = 'test';
        let positionArray = ['c', '12', 'h'];
        let result = board['isWordInBound'](word.length, positionArray);
        assert(result);

        positionArray = ['a', '9', 'v'];
        result = board['isWordInBound'](word.length, positionArray);
        assert(result);

        positionArray = ['l', '9', 'v'];
        result = board['isWordInBound'](word.length, positionArray);
        assert(result);
        done();
    });

    it('should not let the word get out of the board', (done) => {
        let word = 'test';
        let positionArray = ['c', '13', 'h'];
        let result = board['isWordInBound'](word.length, positionArray);
        assert(!result);

        positionArray = ['n', '9', 'v'];
        result = board['isWordInBound'](word.length, positionArray);
        assert(!result);


        positionArray = ['d', '12', 'h'];
        result = board['isWordInBound'](word.length, positionArray);
        assert(result);
        board['board'][3][12].setLetter('a');
        result = board['isWordInBound'](word.length, positionArray);
        assert(!result);

        positionArray = ['k', '10', 'v'];
        result = board['isWordInBound'](word.length, positionArray);
        assert(result);
        board['board'][11][9].setLetter('a');
        board['board'][13][9].setLetter('t');
        result = board['isWordInBound'](word.length, positionArray);
        assert(!result);
        done();
    });

    it('should let a placement on the star for first word', (done) => {
        let word = 'test';
        let positionArray = ['h', '6', 'h'];
        let result = board['firstWordValidation'](word.length, positionArray);
        assert(result);

        positionArray = ['e', '8', 'v'];
        result = board['firstWordValidation'](word.length, positionArray);
        assert(result);

        positionArray = ['h', '8', 'h'];
        result = board['firstWordValidation'](word.length, positionArray);
        assert(result);
        done();
    });

    it('should let not first word not touch the star', (done) => {
        let word = 'test';
        let positionArray = ['m', '5', 'h'];
        board['board'][7][7].setLetter('a');
        let result = board['firstWordValidation'](word.length, positionArray);
        assert(result);
        done();
    });

    it('should not let a placement not on the star for first word', (done) => {
        let word = 'test';
        let positionArray = ['i', '6', 'h'];
        let result = board['firstWordValidation'](word.length, positionArray);
        assert(!result);

        positionArray = ['d', '8', 'v'];
        result = board['firstWordValidation'](word.length, positionArray);
        assert(!result);

        positionArray = ['h', '9', 'h'];
        result = board['firstWordValidation'](word.length, positionArray);
        assert(!result);
        done();
    });

    it('should get an empty array for no contact except first word', (done) => {
        let word = 'test';
        let positionArray = ['f', '11', 'v'];
        let contacts = board['getContacts'](word.length, positionArray);

        assert(contacts.length === 1);
        assert(contacts[0][0] === -1);

        board['board'][7][6].setLetter('a');
        board['board'][7][7].setLetter('s');
        
        positionArray = ['i', '6', 'v'];
        contacts = board['getContacts'](word.length, positionArray);
        assert(contacts.length === 0);
        done();
    });

    it('should get all the points of contact of the word', (done) => {
        let word = 'test';
        board['board'][7][6].setLetter('a');
        board['board'][7][7].setLetter('s');

        let positionArray = ['i', '6', 'h'];
        let contacts = board['getContacts'](word.length, positionArray);
        assert(contacts.length === 2);
        assert(contacts[0][0] === 8);
        assert(contacts[0][1] === 6);
        assert(contacts[0][2] === 1);
        
        assert(contacts[1][0] === 8);
        assert(contacts[1][1] === 7);
        assert(contacts[1][2] === 2);

        board['board'][8][6].setLetter('i');

        positionArray = ['i', '6', 'h'];
        contacts = board['getContacts'](word.length, positionArray);
        assert(contacts.length === 2);
        assert(contacts[0][0] === 8);
        assert(contacts[0][1] === 6);
        assert(contacts[0][2] === -1);

        assert(contacts[1][0] === 8);
        assert(contacts[1][1] === 7);
        assert(contacts[1][2] === 1);


        positionArray = ['e', '7', 'v'];
        contacts = board['getContacts'](word.length, positionArray);
        assert(contacts.length === 2);
        assert(contacts[0][0] === 7);
        assert(contacts[0][1] === 6);
        assert(contacts[0][2] === -1);

        assert(contacts[1][0] === 8);
        assert(contacts[1][1] === 6);
        assert(contacts[1][2] === -1);
        done();
    });

    it('should get the attempted word', (done) => {
        let word = 'test';
        let positionArray = ['e', '6', 'h'];
        let contacts = [[-1]];
        let words = board['getWords'](word, positionArray, contacts);
        assert(words.length === 1);
        assert(words[0] === word);

        positionArray = ['e', '8', 'v'];
        contacts = [[-1]];
        words = board['getWords'](word, positionArray, contacts);
        assert(words.length === 1);
        assert(words[0] === word);


        board['board'][7][7].setLetter('a');
        let expectedWord = 'teast';
        positionArray = ['h', '6', 'h'];
        contacts = [[-1]];
        words = board['getWords'](word, positionArray, contacts);
        assert(words.length === 1);
        assert(words[0] === expectedWord);

        expectedWord = 'tesat';
        positionArray = ['e', '8', 'v'];
        contacts = [[-1]];
        words = board['getWords'](word, positionArray, contacts);
        assert(words.length === 1);
        assert(words[0] === expectedWord);
        done();
    });

    it('should get the words by contact', (done) => {
        let word = 'test';
        board['board'][7][6].setLetter('i');
        board['board'][7][7].setLetter('a');
        board['board'][9][6].setLetter('s');
        board['board'][9][7].setLetter('t');
        
        let expectedWord1 = 'ies';
        let expectedWord2 = 'ast';
        let positionArray = ['i', '6', 'h'];
        let contacts = [[8, 6, 1], [8, 7, 2]];
        let words = board['getWords'](word, positionArray, contacts);
        assert(words.length === 3);
        assert(words[0] === word);
        assert(words[1] === expectedWord1);
        assert(words[2] === expectedWord2);

        expectedWord1 = 'eia';
        expectedWord2 = 'tst';
        positionArray = ['g', '6', 'v'];
        contacts = [[7, 5, 1], [9, 5, 3]];
        words = board['getWords'](word, positionArray, contacts);
        assert(words.length === 3);
        assert(words[0] === word);
        assert(words[1] === expectedWord1);
        assert(words[2] === expectedWord2);
        done();
    });
    
});