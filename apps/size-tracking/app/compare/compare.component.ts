import {CommonModule} from '@angular/common';
import {Component, Input, inject} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatDialog, MatDialogModule} from '@angular/material/dialog';
import {MatIconModule} from '@angular/material/icon';
import {getStorage, getBlob, ref, listAll, } from '@angular/fire/storage'

@Component({
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  selector: 'compare',
  styleUrls: ['./compare.component.scss'],
  templateUrl: './compare.component.html',
})
export class CompareComponent {

  @Input() before: string = '';

  @Input() after: string = '';


  private storage = getStorage();

  async ngOnInit() {
    console.log(await listAll(ref(this.storage)));
    getBlob(ref(this.storage, `angular-size-tracking-objects/${this.before}`)).then(console.log)

    

  }
  
}
