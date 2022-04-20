import { Letter } from './classes/letter';
export const ALPHABET: Letter[] = [
    {
        name: 'A',
        score: 1,
    },
    {
        name: 'B',
        score: 3,
    },
    {
        name: 'C',
        score: 3,
    },
    {
        name: 'D',
        score: 2,
    },
    {
        name: 'E',
        score: 1,
    },
    {
        name: 'F',
        score: 4,
    },
    {
        name: 'G',
        score: 2,
    },
    {
        name: 'H',
        score: 4,
    },
    {
        name: 'I',
        score: 1,
    },
    {
        name: 'J',
        score: 8,
    },
    {
        name: 'K',
        score: 10,
    },
    {
        name: 'L',
        score: 1,
    },
    {
        name: 'M',
        score: 2,
    },
    {
        name: 'N',
        score: 1,
    },
    {
        name: 'O',
        score: 1,
    },
    {
        name: 'P',
        score: 3,
    },
    {
        name: 'Q',
        score: 8,
    },
    {
        name: 'R',
        score: 1,
    },
    {
        name: 'S',
        score: 1,
    },
    {
        name: 'T',
        score: 1,
    },
    {
        name: 'U',
        score: 1,
    },
    {
        name: 'V',
        score: 4,
    },
    {
        name: 'W',
        score: 10,
    },
    {
        name: 'X',
        score: 10,
    },
    {
        name: 'Y',
        score: 10,
    },
    {
        name: 'Z',
        score: 10,
    },
    {
        name: '*',
        score: 0,
    },
];

export const lookupLetter = (letter: string): Letter | undefined => {
    return ALPHABET.find((l) => l.name === letter);
};
