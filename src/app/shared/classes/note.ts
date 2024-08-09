import { DocumentData, DocumentReference, QueryDocumentSnapshot, SnapshotOptions } from "@angular/fire/firestore";
import { FirebaseDocInterface } from "./FirebaseDocInterface";
import { User } from "./user";

export class Note extends FirebaseDocInterface {
    public author: DocumentReference<User>;
    public text: string;
    public date: Date;

    constructor(snapshot?: QueryDocumentSnapshot<any>) {       
        super(snapshot, Note.converter);
        if(!snapshot) {
            this.text = '';
            return;
        }

        const data = snapshot?.data();

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