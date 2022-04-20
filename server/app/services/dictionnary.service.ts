import { Dictionnary, DictionnaryInfo } from '@app/classes/dictionary';
import { UNDEFINED } from '@app/constants';
import * as fs from 'fs';
import { promises } from 'fs';
import { EventEmitter } from 'stream';
import { Service } from 'typedi';
import { v4 as uuidv4 } from 'uuid';

@Service()
export class DictionnaryService {
    eventEmitter: EventEmitter = new EventEmitter();
    private readonly dictionnaries: Dictionnary[] = [];
    private nextId = 0;

    async init() {
        if (this.dictionnaries.length !== 0) return;
        this.nextId = 0;
        await this.loadDict('./assets/dictionnary.json');
        await fs.promises.mkdir('./dictionaries/', { recursive: true });
        const files = await fs.promises.readdir('./dictionaries/');
        for (const file of files) await this.loadDict(`./dictionaries/${file}`);
    }

    get(id: number): Dictionnary | undefined {
        return this.dictionnaries.find((dict) => dict.id === id);
    }

    getDictionnaries(): DictionnaryInfo[] {
        return this.dictionnaries.map((dict) => dict.getInfo());
    }

    async add(title: string, description: string, words: string[]): Promise<boolean> {
        if (this.dictionnaries.some((dictionnary) => dictionnary.title === title)) return false;
        const filename = `./dictionaries/dictionary-${uuidv4()}.json`;
        const newDict = new Dictionnary(this.nextId, title, description, words, filename);
        this.nextId += 1;
        this.dictionnaries.push(newDict);
        await this.writeDict(newDict);
        this.eventEmitter.emit('update', this.getDictionnaries());
        return true;
    }

    async update(id: number, newTitle?: string, newDescription?: string) {
        const dictionnary = this.dictionnaries.find((dict) => dict.id === id);
        if (!dictionnary) return;
        if (newTitle) dictionnary.title = newTitle;
        if (newDescription) dictionnary.description = newDescription;
        await this.writeDict(dictionnary);
        this.eventEmitter.emit('update', this.getDictionnaries());
    }

    async delete(id: number) {
        const dictionnaryIdx = this.dictionnaries.findIndex((dict) => dict.id === id);
        if (dictionnaryIdx === UNDEFINED || dictionnaryIdx === 0) return;
        await fs.promises.unlink(this.dictionnaries[dictionnaryIdx].filename);
        this.dictionnaries.splice(dictionnaryIdx, 1);
        this.eventEmitter.emit('update', this.getDictionnaries());
    }

    async deleteAll() {
        for (const dictionnary of this.dictionnaries.slice(1)) await fs.promises.unlink(dictionnary.filename);
        this.dictionnaries.splice(1);
        this.eventEmitter.emit('update', this.getDictionnaries());
    }

    private async loadDict(file: string) {
        const fileBuffer = await promises.readFile(file);
        const readDictionary = JSON.parse(fileBuffer.toString());
        this.dictionnaries.push(new Dictionnary(this.nextId, readDictionary.title, readDictionary.description, readDictionary.words, file));
        this.nextId += 1;
    }

    private async writeDict(dict: Dictionnary): Promise<void> {
        const jsonDictionary = JSON.stringify({ title: dict.title, description: dict.description, words: [...dict.words] });
        await fs.promises.writeFile(dict.filename, jsonDictionary);
    }
}
