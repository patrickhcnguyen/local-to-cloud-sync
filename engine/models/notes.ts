export interface Note {
    id: string;
    title: string;
    createdAt: number;
    updatedAt: number;
}

export interface NoteWithContent extends Note {
    content: string;
}