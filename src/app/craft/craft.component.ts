import { Component, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { Input } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { DialogComponent } from '../dialog/dialog.component';
import { AuthService } from '../services/auth.service';
import { catchError, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-craft',
  templateUrl: './craft.component.html',
  styleUrls: ['./craft.component.css']
})
export class CraftComponent implements OnInit {
  selectedInstructions: any[] = [];
  instructions: string[] = 'inbox;outbox;copyfrom;copyto;add;sub;bump+;bump-;jump;jump_zero;jump_neg'.split(';');

  form: FormGroup;
  title = new FormControl('', [Validators.required]);
  description = new FormControl('', [Validators.required]);
  input = new FormControl('', [Validators.required, Validators.pattern("^[0-9a-zA-Z]*$")]);
  output = new FormControl('', [Validators.required, Validators.pattern("^[0-9a-zA-Z]*$")]);
  memory = new FormControl('', [Validators.required, Validators.pattern("^[0-9a-zA-Z-]*$")]);

  constructor(
    private authService: AuthService,
    private formBuilder: FormBuilder,
    private dialog: MatDialog,
  ) {
    this.form = this.formBuilder.group({
      title: this.title,
      description: this.description,
      input: this.input,
      output: this.output,
      memory: this.memory
    });
  }

  ngOnInit(): void {
    for (let name of this.instructions as any) {
      let checked = name === 'inbox' || name === 'outbox';
      let disabled = checked;
      this.selectedInstructions.push({
        checked, disabled, name
      })
    }
  }

  onSubmit(): void {
    if (this.form.valid) {
      this.authService.userDefine({
        title: this.title.value,
        description: this.description.value,
        input: this.input.value,
        output: this.output.value,
        memory: this.memory.value,
        instructions: this.selectedInstructions.filter(inst => inst.checked).map(inst => inst.name),
        worldInfo: [1,2,3]
      }).pipe(catchError((error: HttpErrorResponse) => {
        this.openDialog('Whoops!', 'Something unexpected happened. Check your network connectivity');
        return throwError(() => new Error('Something bad happened!'))
      })).subscribe(result => {
        if (result.message === 'success') {
          this.openDialog('Congratulations!', 'You have successfully created a problem!');
        } else {
          this.openDialog('Registration Failed!', result.message);
        }
        this.title.setValue('')
        this.description.setValue('')
        this.memory.setValue('')
        this.output.setValue('')
        this.input.setValue('')
        for (let inst of this.selectedInstructions) {
          if (!inst.disabled) {
            inst.checked = false;
          }
        }
      });
    }
  }

  openDialog(title: string, message: string): void {
    this.dialog.open(DialogComponent, {
      width: '300px',
      data: { title: title, message: message }
    });
  }

  getEmptyErrorMsg(): string {
    return 'Please give your input!';
  }

  getInputMsg(): string {
    if (this.input.hasError('required')) {
      return this.getEmptyErrorMsg();
    }
    return 'Input can only contain a-z A-Z 0-9';
  }

  getOutputMsg(): string {
    if (this.output.hasError('required')) {
      return this.getEmptyErrorMsg();
    }
    return 'Output can only contain a-z A-Z 0-9';
  }

  getMemoryMsg(): string {
    if (this.memory.hasError('required')) {
      return this.getEmptyErrorMsg();
    }
    return 'Memory can only contain a-z A-Z 0-9 dash';
  }

}
