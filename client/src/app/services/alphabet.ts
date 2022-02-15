/* eslint-disable prettier/prettier */
export interface Letter {
    id: number;
    name: string;
    score: number;
    quantity: number;
}

export const alphabet = [
    {
        id: 1,
        name: 'A',
        score: 1,
        quantity: 9,
    },
    {
        id: 2,
        name: 'B',
        score: 3,
        quantity: 2,
    },
    {
        id: 3,
        name: 'C',
        score: 3,
        quantity: 2,
    },
    {
        id: 4,
        name: 'D',
        score: 2,
        quantity: 4,
    },
    {
        id: 5,
        name: 'E',
        score: 1,
        quantity: 12,
    },
    {
        id: 6,
        name: 'F',
        score: 4,
        quantity: 2,
    },
    {
        id: 7,
        name: 'G',
        score: 2,
        quantity: 3,
    },
    {
        id: 8,
        name: 'H',
        score: 4,
        quantity: 2,
    },
    {
        id: 9,
        name: 'I',
        score: 1,
        quantity: 9,
    },
    {
        id: 10,
        name: 'J',
        score: 8,
        quantity: 1,
    },
    {
        id: 11,
        name: 'K',
        score: 5,
        quantity: 1,
    },
    {
        id: 12,
        name: 'L',
        score: 1,
        quantity: 4,
    },
    {
        id: 13,
        name: 'M',
        score: 3,
        quantity: 2,
    },
    {
        id: 14,
        name: 'N',
        score: 1,
        quantity: 6,
    },
    {
        id: 15,
        name: 'O',
        score: 1,
        quantity: 8,
    },
    {
        id: 16,
        name: 'P',
        score: 3,
        quantity: 2,
    },
    {
        id: 17,
        name: 'Q',
        score: 10,
        quantity: 1,
    },
    {
        id: 18,
        name: 'R',
        score: 1,
        quantity: 6,
    },
    {
        id: 19,
        name: 'S',
        score: 1,
        quantity: 4,
    },
    {
        id: 20,
        name: 'T',
        score: 1,
        quantity: 6,
    },
    {
        id: 21,
        name: 'U',
        score: 1,
        quantity: 4,
    },
    {
        id: 22,
        name: 'V',
        score: 4,
        quantity: 2,
    },
    {
        id: 23,
        name: 'W',
        score: 4,
        quantity: 2,
    },
    {
        id: 24,
        name: 'X',
        score: 8,
        quantity: 1,
    },
    {
        id: 25,
        name: 'Y',
        score: 4,
        quantity: 2,
    },
    {
        id: 26,
        name: 'Z',
        score: 10,
        quantity: 1,
    },
];
const amount = 7;
const selectedLetters = [];
for (let i = 0; i < amount; i++) {
    const index = Math.floor(Math.random() * alphabet.length);
    selectedLetters.push(alphabet[index]);
}
export const letters: Letter[] = selectedLetters;
