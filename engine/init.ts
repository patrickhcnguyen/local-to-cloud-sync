// ensures schema always exists

import fs from 'fs';
import path from 'path';
import { openDB, runSchema } from './storage/sqlite';

export async function init() {
    const schema = fs.readFileSync(
        path.join(__dirname, 'storage', 'schema.sql'),
        'utf8'
    );

    await runSchema(schema);
    return openDB();
}