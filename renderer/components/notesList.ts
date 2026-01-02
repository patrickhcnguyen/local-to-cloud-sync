// Notes list component for displaying multiple notes

interface Note {
  id: number;
  title: string;
  content: string;
  createdAt: Date;
}

export class NotesListComponent {
  private container: HTMLElement;
  private notes: Note[] = [];
  private selectedNoteId: number | null = null;

  constructor(containerId: string) {
    this.container = document.getElementById(containerId) as HTMLElement;
  }

  public setNotes(notes: Note[]): void {
    this.notes = notes;
    this.render();
  }

  public addNote(note: Note): void {
    this.notes.unshift(note);
    this.render();
  }

  public updateNote(updatedNote: Note): void {
    const index = this.notes.findIndex(n => n.id === updatedNote.id);
    if (index >= 0) {
      this.notes[index] = updatedNote;
      this.render();
    }
  }

  public removeNote(noteId: number): void {
    this.notes = this.notes.filter(n => n.id !== noteId);
    if (this.selectedNoteId === noteId) {
      this.selectedNoteId = null;
    }
    this.render();
  }

  public selectNote(noteId: number): void {
    this.selectedNoteId = noteId;
    this.render();
  }

  public getSelectedNote(): Note | null {
    return this.notes.find(n => n.id === this.selectedNoteId) || null;
  }

  public getNotesCount(): number {
    return this.notes.length;
  }

  private render(): void {
    this.container.innerHTML = '';

    if (this.notes.length === 0) {
      this.renderEmptyState();
      return;
    }

    this.notes.forEach(note => {
      const noteItem = this.createNoteItem(note);
      this.container.appendChild(noteItem);
    });

    this.updateNotesCount();
  }

  private createNoteItem(note: Note): HTMLElement {
    const noteItem = document.createElement('div');
    noteItem.className = 'note-item';
    noteItem.dataset.noteId = note.id.toString();

    if (this.selectedNoteId === note.id) {
      noteItem.classList.add('active');
    }

    noteItem.innerHTML = `
      <div class="note-item-title">${note.title || 'Untitled'}</div>
      <div class="note-item-preview">${this.getNotePreview(note.content)}</div>
      <div class="note-item-date">${this.formatDate(note.createdAt)}</div>
    `;

    noteItem.addEventListener('click', () => {
      this.selectNote(note.id);
      this.container.dispatchEvent(new CustomEvent('noteSelected', { detail: note }));
    });

    return noteItem;
  }

  private renderEmptyState(): void {
    const emptyState = document.createElement('div');
    emptyState.className = 'empty-notes-state';
    emptyState.innerHTML = `
      <div class="empty-notes-content">
        <p>No notes yet</p>
        <small>Create your first note to get started</small>
      </div>
    `;
    this.container.appendChild(emptyState);
  }

  private getNotePreview(content: string): string {
    if (!content) return '';
    return content.length > 100 ? content.substring(0, 100) + '...' : content;
  }

  private formatDate(date: Date | string): string {
    const d = new Date(date);
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  private updateNotesCount(): void {
    const notesCountElement = document.getElementById('notes-count');
    if (notesCountElement) {
      notesCountElement.textContent = `${this.notes.length} note${this.notes.length !== 1 ? 's' : ''}`;
    }
  }
}
