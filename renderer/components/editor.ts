// Editor component for note editing

interface Note {
  id: number;
  title: string;
  content: string;
  createdAt: Date;
}

export class EditorComponent {
  private container: HTMLElement;
  private titleInput: HTMLInputElement;
  private contentTextarea: HTMLTextAreaElement;
  private saveButton: HTMLButtonElement;
  private deleteButton: HTMLButtonElement;
  private currentNote: Note | null = null;

  constructor(containerId: string) {
    this.container = document.getElementById(containerId) as HTMLElement;
    this.initializeElements();
    this.attachEventListeners();
  }

  private initializeElements(): void {
    this.titleInput = this.container.querySelector('#note-title') as HTMLInputElement;
    this.contentTextarea = this.container.querySelector('#note-content') as HTMLTextAreaElement;
    this.saveButton = this.container.querySelector('#save-note-btn') as HTMLButtonElement;
    this.deleteButton = this.container.querySelector('#delete-note-btn') as HTMLButtonElement;
  }

  private attachEventListeners(): void {
    this.saveButton.addEventListener('click', () => this.saveNote());
    this.deleteButton.addEventListener('click', () => this.deleteNote());

    // Auto-save on content change (debounced)
    let saveTimeout: number;
    const debouncedSave = () => {
      clearTimeout(saveTimeout);
      saveTimeout = window.setTimeout(() => this.saveNote(), 1000);
    };

    this.titleInput.addEventListener('input', debouncedSave);
    this.contentTextarea.addEventListener('input', debouncedSave);
  }

  public setNote(note: Note): void {
    this.currentNote = note;
    this.titleInput.value = note.title;
    this.contentTextarea.value = note.content;
    this.deleteButton.style.display = 'inline-block';
  }

  public clearNote(): void {
    this.currentNote = null;
    this.titleInput.value = '';
    this.contentTextarea.value = '';
    this.deleteButton.style.display = 'none';
  }

  public createNewNote(): Note {
    const newNote: Note = {
      id: Date.now(),
      title: '',
      content: '',
      createdAt: new Date()
    };
    this.setNote(newNote);
    this.titleInput.focus();
    return newNote;
  }

  private async saveNote(): Promise<void> {
    if (!this.currentNote) return;

    this.currentNote.title = this.titleInput.value;
    this.currentNote.content = this.contentTextarea.value;

    try {
      const result = await (window as any).electronAPI.saveNote(this.currentNote);
      console.log('Note saved:', result);
      // Dispatch custom event for parent components to handle
      this.container.dispatchEvent(new CustomEvent('noteSaved', { detail: this.currentNote }));
    } catch (error) {
      console.error('Failed to save note:', error);
    }
  }

  private async deleteNote(): Promise<void> {
    if (!this.currentNote) return;

    if (confirm('Are you sure you want to delete this note?')) {
      try {
        await (window as any).electronAPI.deleteNote(this.currentNote.id);
        this.container.dispatchEvent(new CustomEvent('noteDeleted', { detail: this.currentNote }));
        this.clearNote();
      } catch (error) {
        console.error('Failed to delete note:', error);
      }
    }
  }

  public getCurrentNote(): Note | null {
    return this.currentNote;
  }

  public focusTitle(): void {
    this.titleInput.focus();
  }
}
