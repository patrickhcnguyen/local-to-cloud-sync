/**
 * API Core  logic
 */

import crypto from 'crypto';
import { Note, NoteWithContent } from './models/notes';
import * as db from './storage/sqlite';

export async function createNote(): Promise<NoteWithContent> {
    const now = Date.now();

    // initialize a new note state with a random id and current timestamp
    const note = {
        id: crypto.randomUUID(),
        title: "Untitled",
        createdAt: now,
        updatedAt: now,
        content: "",
    };

    await db.insertNote(note);
    return note;
}

export async function getAllNotes(): Promise<NoteWithContent[]> {
    return await db.fetchAllNotes();
}

export async function getNoteByID(id: string): Promise<NoteWithContent> {
    return await db.fecthNoteByID(id);
}

export async function updateNoteContent(id: string, content: string): Promise<NoteWithContent> {
    const now = Date.now();
    await db.updateNoteContent(id, content, now);
    return { id, title: "Untitled", content, createdAt: now, updatedAt: now };
}

export async function deleteNote(id: string): Promise<void> {
    await db.deleteNote(id);
}