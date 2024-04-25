import { Component } from '@angular/core';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-cart-status',
  templateUrl: './cart-status.component.html',
  styleUrl: './cart-status.component.css'
})
export class CartStatusComponent {
  totalPrice: number = 0.00;
  totalQuantity: number = 0;

  constructor(private cartService: CartService){}

  ngOnInit(): void{
    this.updateCartStatus();
  }
  updateCartStatus() {
    //subscribe the cart totalPrice
    this.cartService.totalPrice.subscribe(
      //received event from subscription from data come in
      data => this.totalPrice = data
    )
    //subscribe the cart totalQuantity
    this.cartService.totalQuantity.subscribe(
      //received event from subscription from data come in
      data => this.totalQuantity = data
    )
  }
}
