import {openDB} from 'idb';
import type {Career} from './engine';
const db=()=>openDB('road-to-glory',1,{upgrade(db){db.createObjectStore('careers')}});
export async function saveCareer(game:Career,slot='autosave'){await(await db()).put('careers',game,slot)}
export async function loadCareer(slot='autosave'):Promise<Career|undefined>{const value=await(await db()).get('careers',slot);if(value&&value.version!==1)throw Error('Unsupported save version');return value}
