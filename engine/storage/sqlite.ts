import sqlite3 from 'sqlite3';
import fs from 'fs';
import path from 'path';
import { NoteWithContent } from '../models/notes';

const DB_PATH = path.join(process.cwd(), 'data', 'notes.db');

let db: sqlite3.Database 

export function openDB() {
    if (!fs.existsSync("data")) {
        fs.mkdirSync("data");
    }

    db = new sqlite3.Database(DB_PATH);
    db.run(fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8'));
    return db;
}

export function runSchema(schema: string) {
    return new Promise<void>((resolve, reject) => {
        db.exec(schema, err => (err ? reject(err) : resolve()));
    });
}

export function insertNote(note: NoteWithContent) {
    return new Promise<void>((resolve, reject) => {
        db.run(
            `INSERT INTO notes (id, title, content, created_at, updated_at) VALUES(?, ?, ?, ?, ?)`,
            [
                note.id,
                note.title,
                note.content,
                note.createdAt,
                note.updatedAt,
            ],
            (err) => (err ? reject(err) : resolve())
        );
    });
}

export function updateNoteContent(id: string, content: string, updatedAt: number) {
    return new Promise<void>((resolve, reject) => {
        db.run(
            `UPDATE notes SET content = ?, updated_at = ? WHERE id = ?`,
            [content, updatedAt, id],
            err => (err ? reject(err) : resolve())
        );
    });
}

export function deleteNote(id: string) {
    return new Promise<void>((resolve, reject) => {
        db.run(
            `DELETE FROM notes WHERE id = ?`,
            [id],
            err => (err ? reject(err) : resolve())
        );
    });
}

export function fetchAllNotes() {
    return new Promise<NoteWithContent[]>((resolve, reject) => {
        db.all(
            `SELECT * FROM notes`,
            [],
            (err, rows) => (err ? reject(err) : resolve(rows as NoteWithContent[]))
        );
    });
}

export function fecthNoteByID(id: string) {
    return new Promise<NoteWithContent | undefined>((resolve, reject) => {
        db.get(
            `SELECT * FROM notes WHERE id = ?`,
            [id],
            (err, row) => (err ? reject(err) : resolve(row as NoteWithContent))
        );
    });
}