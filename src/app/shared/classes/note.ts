import { DocumentData, DocumentReference, QueryDocumentSnapshot, SnapshotOptions } from "@angular/fire/firestore";
import { FirebaseDocInterface } from "./FirebaseDocInterface";
import { User } from "./user";

export class Note extends FirebaseDocInterface {
    public author: DocumentReference<User>;
    public text: string;
    public date: Date;

    constructor(snapshotOrRef: QueryDocumentSnapshot<any> | DocumentReference<any>) {
        let snapshot;
        if(snapshotOrRef instanceof QueryDocumentSnapshot) {
            snapshot = snapshotOrRef
        }
        
        super(snapshot, Note.converter);
        const data = snapshot?.data();

        if(snapshotOrRef instanceof DocumentReference) {
            this.text = '';
            return;
        }

        this.author = (data.author as DocumentReference).withConverter(User.converter);
        this.text = data.text;
        this.date = data.date?.toDate();
    }

    public static converter = {
        toFirestore(data: Note): DocumentData {
            return {
                author: data.author,
                text: data.text,
                date: data.date
            };
        },
        fromFirestore(snapshot: QueryDocumentSnapshot<DocumentData>, options: SnapshotOptions): Note {
            return new Note(snapshot);
        }
    }
}