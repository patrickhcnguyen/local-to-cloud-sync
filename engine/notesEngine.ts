import { insertNote, updateNoteContent, deleteNote, fetchAllNotes } from './storage/sqlite';
import { NoteWithContent } from './models/notes';

export async function saveNote(noteData: any): Promise<{ success: boolean; id: string }> {
  try {
    const note: NoteWithContent = {
      id: noteData.id.toString(),
      title: noteData.title || '',
      content: noteData.content || '',
      createdAt: noteData.createdAt instanceof Date ? noteData.createdAt.getTime() : noteData.createdAt,
      updatedAt: noteData.updatedAt instanceof Date ? noteData.updatedAt.getTime() : Date.now(),
    };

    const existingNotes = await fetchAllNotes();
    const existingNote = existingNotes.find(n => n.id === note.id);

    if (existingNote) {
      await updateNoteContent(note.id, note.content, note.updatedAt);
    } else {
      await insertNote(note);
    }

    return { success: true, id: note.id };
  } catch (error) {
    console.error('Error saving note:', error);
    throw error;
  }
}

export async function loadNotes(): Promise<any[]> {
  try {
    const notes = await fetchAllNotes();

    return notes.map(note => ({
      id: parseInt(note.id),
      title: note.title,
      content: note.content,
      createdAt: new Date(note.createdAt),
      updatedAt: new Date(note.updatedAt),
    }));
  } catch (error) {
    console.error('Error loading notes:', error);
    throw error;
  }
}

export async function removeNote(noteId: number): Promise<{ success: boolean }> {
  try {
    await deleteNote(noteId.toString());
    return { success: true };
  } catch (error) {
    console.error('Error deleting note:', error);
    throw error;
  }
}
