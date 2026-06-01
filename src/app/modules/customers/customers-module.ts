import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { CustomersRoutingModule } from './customers-routing-module';
import { CustomersComponent } from './customers';

@NgModule({
  declarations: [CustomersComponent],
  imports: [CommonModule, FormsModule, ReactiveFormsModule, CustomersRoutingModule],
})
export class CustomersModule {}
