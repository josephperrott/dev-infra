import {CommonModule} from '@angular/common';
import {Component, inject} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatDialog, MatDialogModule} from '@angular/material/dialog';
import {MatIconModule} from '@angular/material/icon';
import { CompareComponent } from '../compare/compare.component.js';

@Component({
  standalone: true,
  imports: [CommonModule, CompareComponent, MatDialogModule, MatButtonModule, MatIconModule],
  selector: 'main',
  styleUrls: ['./main.component.scss'],
  templateUrl: './main.component.html',
})
export class MainComponent {
}
