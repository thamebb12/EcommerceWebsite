import { Injectable } from '@angular/core';
import { CartItem } from '../common/cart-item';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CartService {

  cartItems: CartItem[] = [];

  // subject is a subclass of Observable, use to publish event
  //the evet will be sent to all subscribers
  totalPrice: Subject<number> = new BehaviorSubject<number>(0);
  totalQuantity: Subject<number> = new BehaviorSubject<number>(0);
  theCartItem: any;

  //session storage
  // storage: Storage = sessionStorage;

  //local storage
  storage: Storage = localStorage;


  constructor() {
    //read data from storage
    let data = JSON.parse(this.storage.getItem('cartItems') as string);
    if (data) {
      this.cartItems = data;
      this.computeCartTotal()
    }
  }

  // addToCart(cartItem: CartItem){
  //   //check if already have the item in the cart
  //   let alreadyExistsInCart: boolean = false;
  //   let existingCartItem: CartItem = undefined!;
  //   //find the item in the cart based on the item id
  //   if(this.cartItems.length > 0){
  //     for (let tempCartItem of this.cartItems){
  //       if(tempCartItem.id === cartItem.id){
  //         existingCartItem = tempCartItem;
  //         break;
  //       }
  //     // existingCartItem = this.cartItems.find( tempCartItem => tempCartItem.id === cartItem.id )
      
  //     }
  //     //check if found 
  //     alreadyExistsInCart = (existingCartItem != undefined)
  //   }
  //   if(alreadyExistsInCart){
  //     existingCartItem.quantity++
  //   }else{
  //     //add item to array
  //     this.cartItems.push(cartItem);
  //   }
  //   this.computeCartTotal();
  // }
  addToCart(theCartItem: CartItem) {

    // check if we already have the item in our cart
    let alreadyExistsInCart: boolean = false;
    let existingCartItem: CartItem | undefined = undefined;

    if (this.cartItems.length > 0) {
      // find the item in the cart based on item id

      existingCartItem = this.cartItems.find( tempCartItem => tempCartItem.id === theCartItem.id );

      // check if we found it
      alreadyExistsInCart = (existingCartItem != undefined);
    }

    if (alreadyExistsInCart && existingCartItem != undefined) {
      // increment the quantity
      existingCartItem.quantity++;
    }
    else {
      // just add the item to the array
      this.cartItems.push(theCartItem);
    }

    // compute cart total price and total quantity
    this.computeCartTotal();
  }
  
  computeCartTotal() {
    let totalPriceValue: number = 0;
    let totalQuantityValue: number = 0;

    for(let currentCartItem of this.cartItems){
      totalPriceValue += currentCartItem.quantity * currentCartItem.unitPrice
      totalQuantityValue += currentCartItem.quantity
    }
    //publish the new value ... all subscriber will receive the new data
    //.next publish/sent event
    this.totalPrice.next(totalPriceValue)
    this.totalQuantity.next(totalQuantityValue)

    //log
    this.logCartData(totalPriceValue, totalQuantityValue)

    this.persistCartItem();
  }
  persistCartItem(){
    //json stringify convert object to JSON string
    this.storage.setItem('cartItems', JSON.stringify(this.cartItems))
  }

  
  logCartData(totalPriceValue: number, totalQuantityValue: number) {
    console.log("Content of the cart")
    for(let tempCartItem of this.cartItems){
      const subTotalPrice = tempCartItem.quantity * tempCartItem.unitPrice
      console.log('name: ' + tempCartItem.name + ',quantity = ' + tempCartItem.quantity + ',unitPrice = ' + tempCartItem.unitPrice
        + ',subTotalPrice ='+ subTotalPrice)
    }
    console.log('totalPrice : ' + totalPriceValue.toFixed(2) + 'totalQuantity : '  + totalQuantityValue)
  }

  decrementQuantity(theCartItem: CartItem) {
    theCartItem.quantity--;
    if(theCartItem.quantity === 0){
      this.remove(theCartItem)
    }else{
      this.computeCartTotal()
    }
  }
  remove(theCartItem: CartItem) {
    // get index of item in the array
    const itemIndex = this.cartItems.findIndex((tempCartItem: CartItem) => tempCartItem.id === theCartItem.id);
    // if found, remove the item
    if (itemIndex > -1) {
      this.cartItems.splice(itemIndex, 1);
      this.computeCartTotal();
    }
  }
}
