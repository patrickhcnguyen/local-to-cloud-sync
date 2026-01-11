// ensures schema always exists

import { openDB } from './storage/sqlite';

export async function init() {
    return openDB();
}