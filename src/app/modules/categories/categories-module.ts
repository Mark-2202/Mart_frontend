import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { CategoriesRoutingModule } from './categories-routing-module';
import { CategoriesComponent } from './categories';

@NgModule({
  declarations: [CategoriesComponent],
  imports: [CommonModule, FormsModule, ReactiveFormsModule, CategoriesRoutingModule],
})
export class CategoriesModule {}
