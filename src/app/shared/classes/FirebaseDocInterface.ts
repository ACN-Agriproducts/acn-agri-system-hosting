import { DocumentReference, QueryDocumentSnapshot, setDoc, updateDoc, deleteDoc, Query, CollectionReference, query, Unsubscribe } from "@angular/fire/firestore";
import { SessionInfo } from "@core/services/session-info/session-info.service";
import { DocumentSnapshot, limit, onSnapshot, QuerySnapshot, startAfter } from "firebase/firestore";

export abstract class FirebaseDocInterface {
    static session: SessionInfo;
    ref: DocumentReference;

    constructor(snapshot: QueryDocumentSnapshot<any>, converter: any) {
        this.ref = snapshot.ref.withConverter(converter);
    }

    public set(): Promise<void> {
        return setDoc(this.ref, this);
    }

    public update(data: any): Promise<void> {
        return updateDoc(this.ref, data)
    }

    public delete(): Promise<void> {
        return deleteDoc(this.ref);
    }
}

export class Pagination<T extends FirebaseDocInterface> {
    list: T[];
    lastSnapshot: DocumentSnapshot;
    paginationStep: number;
    unsubscribe: Unsubscribe[];

    constructor(
        public ref: Query<T> | CollectionReference<T>, 
        public steps: number,
        public onNext: (snapshot: QuerySnapshot<T>) => void = () => {}
    ) {
        this.unsubscribe = [];
        this.list = [];
        this.paginationStep = 0;
        this.callSnapshot();
    }

    public callSnapshot(): void {
        const startingIndex = this.list.length;
        let ref = query(this.ref, limit(this.steps));
        if(this.list.length > 0){
            ref = query(ref, startAfter(this.lastSnapshot));
            console.log(`Starting after ${this.list[this.list.length - 1]['id']}`)
        }

        let first = true;
        const temp = onSnapshot(ref, next => {
            this.onNext(next);

            if(first) {
                this.list.push(...next.docs.map(c => c.data()));
                this.lastSnapshot = next.docs[next.docs.length - 1];
                first = false;
                return;
            }
      
            for(const change of next.docChanges()){
                if(change.type == 'added' || change.type == 'removed') {
                    this.restart();
                }
        
                if(change.type == 'modified') {
                    this.list[change.oldIndex] = change.doc.data();
                }
            }
        });

        this.unsubscribe.push(temp);
    }

    public getNext(onNext: (snapshot: QuerySnapshot<T>) => void = this.onNext) {
        this.paginationStep++;
        this.onNext = onNext;
        this.callSnapshot();
    }

    public restart() {
        this.end();

        const startingIndex = 0;
        const ref = query(this.ref, limit(this.steps * (this.paginationStep + 1)));
        

        let first = true;
        const temp = onSnapshot(ref, next => {
            this.onNext(next);

            if(first) {
                this.list = next.docs.map(doc => doc.data());
                this.lastSnapshot = next.docs[next.docs.length - 1];
                first = false;
                return;
            }
      
            for(const change of next.docChanges()){
                if(change.type == 'added' || change.type == 'removed') {
                    this.restart();
                }
        
                if(change.type == 'modified') {
                  this.list[change.oldIndex + startingIndex] = change.doc.data();
                }
            }
        });

        this.unsubscribe.push(temp);
    }

    public end() {
        this.unsubscribe.forEach(func => {
            func();
        });
        this.unsubscribe = [];
    }
}