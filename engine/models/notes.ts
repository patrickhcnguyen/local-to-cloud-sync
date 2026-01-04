export interface Note {
    id: number;
    title: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface NoteWithContent extends Note {
    content: string;
}