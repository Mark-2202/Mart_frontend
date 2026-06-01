import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { PosRoutingModule } from './pos-routing-module';
import { PosComponent } from './pos';

@NgModule({
  declarations: [PosComponent],
  imports: [CommonModule, FormsModule, ReactiveFormsModule, PosRoutingModule],
})
export class PosModule {}
