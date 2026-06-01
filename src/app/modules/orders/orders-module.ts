import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { OrdersRoutingModule } from './orders-routing-module';
import { OrdersComponent } from './orders';

@NgModule({
  declarations: [OrdersComponent],
  imports: [CommonModule, FormsModule, OrdersRoutingModule],
})
export class OrdersModule {}
