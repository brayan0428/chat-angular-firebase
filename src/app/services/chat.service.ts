import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { Chat } from '../interfaces/chat.interface';
import {map} from 'rxjs/operators';
import { AngularFireAuth } from '@angular/fire/auth';
import { auth } from 'firebase/app';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  public chats:Chat[] = [];
  public usuario:any = {};
  private itemsCollection: AngularFirestoreCollection<Chat>;

  constructor(private afs: AngularFirestore,
              public afAuth: AngularFireAuth) {
    this.afAuth.authState.subscribe(user => {
      this.usuario = {};
      if(!user){
        return;
      }
      this.usuario.nombre = user.displayName;
      this.usuario.uid = user.uid;
    })
  }

  cargarMensajes(){
    this.itemsCollection = this.afs.collection<Chat>('chats',ref => ref.orderBy('fecha','desc').limit(5));
    return this.itemsCollection.valueChanges().pipe(map(data => {
      this.chats = [];
      for(let mensaje of data) {
        this.chats.unshift(mensaje);
      }
      return this.chats;
    })) 
  }

  agregarMensaje(texto:string){
    let mensaje:Chat = {
      nombre : this.usuario.nombre,
      mensaje : texto,
      fecha : new Date().getTime(),
      uid : this.usuario.uid
    }
    return this.itemsCollection.add(mensaje);
  }

  login(proveedor:string) {
    this.afAuth.auth.signInWithPopup(new auth.GoogleAuthProvider());
  }

  logout() {
    this.afAuth.auth.signOut();
  }
}
