import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';

@Injectable({
  providedIn: 'root'
})
export class PlayerService {

  constructor(private socket: Socket) {
  }

  connect(room: string) {
    this.socket.ioSocket.io.opts.query = {
      modelName: localStorage.getItem('modelName'),
      username: localStorage.getItem('username'),
      room: room
    };
    this.socket.connect();
  }

  myMove(quaternion: THREE.Quaternion, walkDir: THREE.Vector3, currentAction: string, position: THREE.Vector3) {
    let result = {
      quaternion: [quaternion.x, quaternion.y, quaternion.z, quaternion.w],
      currentAction: currentAction,
      walkDir: [walkDir.x, walkDir.y, walkDir.z],
      position: [position.x, position.y, position.z]
    }
    this.socket.emit('clientFrame', result);
  }

  mySpeak(message: string) {
    this.socket.emit('speak', { message });
  }

  myCreate(){
    //todo
    this.socket.emit('create', {});
  }

  onOthersCreate(){
    //todo
    return this.socket.fromEvent('create');
  }

  disconnect() {
    this.socket.disconnect();
  }

  onMyJoin() {
    return this.socket.fromEvent('introduction');
  }

  onOthersJoin() {
    return this.socket.fromEvent('newUser');
  }

  onOthersQuit() {
    return this.socket.fromEvent('removeUser');
  }

  onOthersMove() {
    return this.socket.fromEvent('serverFrame');
  }

  onOthersSpeak() {
    return this.socket.fromEvent('speak');
  }
}
