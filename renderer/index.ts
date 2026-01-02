// Renderer process entry point for the notes app

interface Note {
  id: number;
  title: string;
  content: string;
  createdAt: Date;
}

class NotesApp {
  private notes: Note[] = [];
  private currentNote: Note | null = null;

  // DOM elements
  private newNoteBtn: HTMLButtonElement;
  private createFirstNoteBtn: HTMLButtonElement;
  private saveNoteBtn: HTMLButtonElement;
  private deleteNoteBtn: HTMLButtonElement;
  private noteTitleInput: HTMLInputElement;
  private noteContentTextarea: HTMLTextAreaElement;
  private notesList: HTMLDivElement;
  private notesCount: HTMLSpanElement;
  private editorPanel: HTMLElement;
  private emptyState: HTMLElement;

  constructor() {
    this.initializeElements();
    this.attachEventListeners();
    this.loadNotes();
  }

  private initializeElements(): void {
    this.newNoteBtn = document.getElementById('new-note-btn') as HTMLButtonElement;
    this.createFirstNoteBtn = document.getElementById('create-first-note-btn') as HTMLButtonElement;
    this.saveNoteBtn = document.getElementById('save-note-btn') as HTMLButtonElement;
    this.deleteNoteBtn = document.getElementById('delete-note-btn') as HTMLButtonElement;
    this.noteTitleInput = document.getElementById('note-title') as HTMLInputElement;
    this.noteContentTextarea = document.getElementById('note-content') as HTMLTextAreaElement;
    this.notesList = document.getElementById('notes-list') as HTMLDivElement;
    this.notesCount = document.getElementById('notes-count') as HTMLSpanElement;
    this.editorPanel = document.getElementById('note-editor') as HTMLElement;
    this.emptyState = document.getElementById('empty-state') as HTMLElement;
  }

  private attachEventListeners(): void {
    this.newNoteBtn.addEventListener('click', () => this.createNewNote());
    this.createFirstNoteBtn.addEventListener('click', () => this.createNewNote());
    this.saveNoteBtn.addEventListener('click', () => this.saveCurrentNote());
    this.deleteNoteBtn.addEventListener('click', () => this.deleteCurrentNote());

    // Auto-save on content change (debounced)
    let saveTimeout: number;
    this.noteTitleInput.addEventListener('input', () => {
      clearTimeout(saveTimeout);
      saveTimeout = window.setTimeout(() => this.saveCurrentNote(), 1000);
    });

    this.noteContentTextarea.addEventListener('input', () => {
      clearTimeout(saveTimeout);
      saveTimeout = window.setTimeout(() => this.saveCurrentNote(), 1000);
    });
  }

  private async loadNotes(): Promise<void> {
    try {
      this.notes = await (window as any).electronAPI.loadNotes();
      this.renderNotesList();
      this.updateNotesCount();

      // Show empty state if no notes
      if (this.notes.length === 0) {
        this.showEmptyState();
      } else {
        this.hideEmptyState();
        // Select first note by default
        this.selectNote(this.notes[0]);
      }
    } catch (error) {
      console.error('Failed to load notes:', error);
    }
  }

  private renderNotesList(): void {
    this.notesList.innerHTML = '';

    this.notes.forEach(note => {
      const noteItem = document.createElement('div');
      noteItem.className = 'note-item';
      noteItem.dataset.noteId = note.id.toString();

      if (this.currentNote && this.currentNote.id === note.id) {
        noteItem.classList.add('active');
      }

      noteItem.innerHTML = `
        <div class="note-item-title">${note.title || 'Untitled'}</div>
        <div class="note-item-preview">${this.getNotePreview(note.content)}</div>
        <div class="note-item-date">${this.formatDate(note.createdAt)}</div>
      `;

      noteItem.addEventListener('click', () => this.selectNote(note));
      this.notesList.appendChild(noteItem);
    });
  }

  private getNotePreview(content: string): string {
    if (!content) return '';
    return content.length > 100 ? content.substring(0, 100) + '...' : content;
  }

  private formatDate(date: Date | string): string {
    const d = new Date(date);
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  private selectNote(note: Note): void {
    this.currentNote = note;
    this.noteTitleInput.value = note.title;
    this.noteContentTextarea.value = note.content;
    this.deleteNoteBtn.style.display = 'inline-block';
    this.hideEmptyState();
    this.renderNotesList();
  }

  private createNewNote(): void {
    const newNote: Note = {
      id: Date.now(),
      title: '',
      content: '',
      createdAt: new Date()
    };

    this.notes.unshift(newNote);
    this.selectNote(newNote);
    this.renderNotesList();
    this.updateNotesCount();
    this.noteTitleInput.focus();
  }

  private async saveCurrentNote(): Promise<void> {
    if (!this.currentNote) return;

    this.currentNote.title = this.noteTitleInput.value;
    this.currentNote.content = this.noteContentTextarea.value;

    try {
      const result = await (window as any).electronAPI.saveNote(this.currentNote);
      console.log('Note saved:', result);

      // Update the note in the notes array
      const index = this.notes.findIndex(n => n.id === this.currentNote!.id);
      if (index >= 0) {
        this.notes[index] = { ...this.currentNote };
      }

      this.renderNotesList();
      this.updateNotesCount();
    } catch (error) {
      console.error('Failed to save note:', error);
    }
  }

  private async deleteCurrentNote(): Promise<void> {
    if (!this.currentNote) return;

    if (confirm('Are you sure you want to delete this note?')) {
      try {
        await (window as any).electronAPI.deleteNote(this.currentNote.id);
        this.notes = this.notes.filter(n => n.id !== this.currentNote!.id);
        this.currentNote = null;

        if (this.notes.length > 0) {
          this.selectNote(this.notes[0]);
        } else {
          this.showEmptyState();
          this.noteTitleInput.value = '';
          this.noteContentTextarea.value = '';
          this.deleteNoteBtn.style.display = 'none';
        }

        this.renderNotesList();
        this.updateNotesCount();
      } catch (error) {
        console.error('Failed to delete note:', error);
      }
    }
  }

  private updateNotesCount(): void {
    this.notesCount.textContent = `${this.notes.length} note${this.notes.length !== 1 ? 's' : ''}`;
  }

  private showEmptyState(): void {
    this.emptyState.style.display = 'flex';
    this.editorPanel.style.display = 'none';
  }

  private hideEmptyState(): void {
    this.emptyState.style.display = 'none';
    this.editorPanel.style.display = 'block';
  }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new NotesApp();
});
