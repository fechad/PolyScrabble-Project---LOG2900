import { LetterNode } from '@app/classes/letter-node';
import * as fs from 'fs';
import { promises } from 'fs';
import { Service } from 'typedi';

export type Dictionnary = { id: number; name: string; words: string[]; trie: LetterNode };
export type DictionnaryInfo = { id: number; name: string; words: string[] };

@Service()
export class DictionnaryService {
    dictionnaries: Dictionnary[] = [];

    static generateTrie(dictionnary: string[]): LetterNode {
        const trie = new LetterNode('*');
        for (const word of dictionnary) {
            let actualNode = trie;
            [...word].forEach((letter) => {
                actualNode = actualNode.addNext(letter.toUpperCase());
            });
            actualNode.terminal = true;
        }
        return trie;
    }

    async init() {
        const files = await fs.promises.readdir('./dictionaries/');
        for (const file of files) {
            const id = Number(file.split('-')[1][0]);
            const fileBuffer = await promises.readFile(`./dictionaries/dictionary-${id}.json`);
            const readDictionary = JSON.parse(fileBuffer.toString());
            this.dictionnaries.push({
                id,
                name: readDictionary.title,
                words: readDictionary.words,
                trie: DictionnaryService.generateTrie(readDictionary.words),
            });
        }
    }

    getDictionnaries() {
        return this.dictionnaries.map((dict) => ({ id: dict.id, name: dict.name } as DictionnaryInfo));
    }

    isValidWord(id: number, playedWord: string) {
        if (!this.isWord(playedWord)) {
            return false;
        }
        return this.dictionnaries[id].words.includes(playedWord.toLowerCase());
    }

    validateWords(id: number, wordList: string[]): boolean {
        return wordList.map((word) => word.split(';')).every((words) => this.isValidWord(id, words[words.length - 1]));
    }

    private isWord(expression: string): boolean {
        return expression.match(/[a-z]+/i) !== null;
    }
}
