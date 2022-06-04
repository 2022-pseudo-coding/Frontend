import { Component, OnInit } from '@angular/core';
import { PlayerService } from '../services/player.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {
  showSideNav:boolean = false;

  constructor(private playerService: PlayerService) { }

  ngOnInit(): void {
    this.playerService.onOthersSpeak().subscribe((resp:any) => {
      //todo
      let username = resp.username;
      let message = resp.message;
    });
  }

  speak(message:string): void{
    this.playerService.mySpeak(message);
  }

}
