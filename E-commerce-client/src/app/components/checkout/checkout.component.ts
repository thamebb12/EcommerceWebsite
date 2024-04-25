import { Component, OnInit } from '@angular/core';
import {
  Form,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { FormService } from '../../services/form.service';
import { Country } from '../../common/country';
import { State } from '../../common/state';
import { ThameShopValidators } from '../../validators/thame-shop-validators';
import { CartService } from '../../services/cart.service';
import { CheckoutService } from '../../services/checkout.service';
import { Router } from '@angular/router';
import { Order } from '../../common/order';
import { OrderItem } from '../../common/order-item';
import { Purchase } from '../../common/purchase';
import { Customer } from '../../common/customer';
import { environment } from '../../../environments/environment';
import { PaymentInfo } from '../../common/payment-info';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.css',
})
export class CheckoutComponent implements OnInit {
  checkoutFormGroup!: FormGroup;

  totalPrice: number = 0;
  totalQuantity: number = 0;

  creditCardYears: number[] = [];
  creditCardMonths: number[] = [];

  countries: Country[] = [];

  shippingAddressStates: State[] = [];
  billingAddressStates: State[] = [];

  storage: Storage = sessionStorage;

  //initialize Srtipe api
  stripe = Stripe(environment.stripePublishableKey)

  paymentInfo: PaymentInfo = new PaymentInfo();
  cardElement: any;
  displayError: any = ""
  isDisabled: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private formService: FormService,
    private cartService: CartService,
    private checkoutService: CheckoutService,
    private router: Router
  ) {}

  ngOnInit(): void {
    //setup stripe payment form
    this.setupStripePaymentForm();
    
    this.reviewCartDetails();

    //read the user email address from the browser storage
    const theEmail = JSON.parse(this.storage.getItem('userEmail')!);

    this.checkoutFormGroup = this.formBuilder.group({
      customer: this.formBuilder.group({
        firstName: new FormControl('', [
          Validators.required,
          Validators.minLength(2),
          ThameShopValidators.notOnlyWhitespace,
        ]),

        lastName: new FormControl('', [
          Validators.required,
          Validators.minLength(2),
          ThameShopValidators.notOnlyWhitespace,
        ]),

        email: new FormControl(theEmail, [
          Validators.required,
          Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$'),
        ]),
      }),
      shippingAddress: this.formBuilder.group({
        street: new FormControl('', [
          Validators.required,
          Validators.minLength(2),
          ThameShopValidators.notOnlyWhitespace,
        ]),
        city: new FormControl('', [
          Validators.required,
          Validators.minLength(2),
          ThameShopValidators.notOnlyWhitespace,
        ]),
        state: new FormControl('', [Validators.required]),
        country: new FormControl('', [Validators.required]),
        zipCode: new FormControl('', [
          Validators.required,
          Validators.minLength(2),
          ThameShopValidators.notOnlyWhitespace,
        ]),
      }),
      billingAddress: this.formBuilder.group({
        street: new FormControl('', [
          Validators.required,
          Validators.minLength(2),
          ThameShopValidators.notOnlyWhitespace,
        ]),
        city: new FormControl('', [
          Validators.required,
          Validators.minLength(2),
          ThameShopValidators.notOnlyWhitespace,
        ]),
        state: new FormControl('', [Validators.required]),
        country: new FormControl('', [Validators.required]),
        zipCode: new FormControl('', [
          Validators.required,
          Validators.minLength(2),
          ThameShopValidators.notOnlyWhitespace,
        ]),
      }),
      // creditCard: this.formBuilder.group({
      //   cardType: new FormControl('', [Validators.required]),
      //   nameOnCard: new FormControl('', [
      //     Validators.required,
      //     Validators.minLength(2),
      //     ThameShopValidators.notOnlyWhitespace,
      //   ]),
      //   cardNumber: new FormControl('', [
      //     Validators.required,
      //     Validators.pattern('[0-9]{16}'),
      //   ]),
      //   securityCode: new FormControl('', [
      //     Validators.required,
      //     Validators.pattern('[0-9]{3}'),
      //   ]),
      //   expirationMonth: [''],
      //   expirationYear: [''],
      // }),
    });

    //populate credit card month
    // const startMonth: number = new Date().getMonth() + 1
    // console.log("Start month"+startMonth)
    // this.formService.getCreditCardMonths(startMonth).subscribe(
    //   data => {
    //     console.log(JSON.stringify(data))
    //     this.creditCardMonths = data
    //   }
    // )
    // //year
    // this.formService.getCreditCardYears().subscribe(
    //   data => {
    //     console.log(JSON.stringify(data))
    //     this.creditCardYears = data
    //   }
    // )

    //populate credit card month

    // const startMonth: number = new Date().getMonth() + 1;
    // console.log('startMonth: ' + startMonth);

    // this.formService.getCreditCardMonths(startMonth).subscribe((data) => {
    //   console.log('Retrieved credit card months: ' + JSON.stringify(data));
    //   this.creditCardMonths = data;
    // });

    // populate credit card years

    // this.formService.getCreditCardYears().subscribe((data) => {
    //   console.log('Retrieved credit card years: ' + JSON.stringify(data));
    //   this.creditCardYears = data;
    // });


    //populate countries
    this.formService.getCountries().subscribe((data) => {
      console.log(JSON.stringify(data));
      this.countries = data;
    });
  }
  setupStripePaymentForm() {
    //get a handle to stripe element
    var elements = this.stripe.elements();
    //create card element
    this.cardElement = elements.create('card',{hidePostalCode: true});
    //add an instance of card UI component into the 'card-element' div
    this.cardElement.mount('#card-element'); 
    //add event binding for the 'change' event 
    this.cardElement.on('change',(event: any) => {
      //get handle to card errors element
      this.displayError = document.getElementById('card-errors');
      if(event.complete){
        this.displayError.textContent = "";
      }else if(event.error){
        //show validation errors 
        this.displayError.textContent = event.error.message;
      }
    })
  }
  reviewCartDetails() {
    //subscribe to cartservice.totalQuantity
    this.cartService.totalQuantity.subscribe(
      (totalQuantity) => (this.totalQuantity = totalQuantity)
    );
    //subscribe to cartservice.totalPrice
    this.cartService.totalPrice.subscribe(
      (totalPrice) => (this.totalPrice = totalPrice)
    );
  }

  get firstName() {
    return this.checkoutFormGroup.get('customer.firstName');
  }
  get lastName() {
    return this.checkoutFormGroup.get('customer.lastName');
  }
  get email() {
    return this.checkoutFormGroup.get('customer.email');
  }

  get shippingAddressStreet() {
    return this.checkoutFormGroup.get('shippingAddress.street');
  }
  get shippingAddressCity() {
    return this.checkoutFormGroup.get('shippingAddress.city');
  }
  get shippingAddressState() {
    return this.checkoutFormGroup.get('shippingAddress.state');
  }
  get shippingAddressZipCode() {
    return this.checkoutFormGroup.get('shippingAddress.zipCode');
  }
  get shippingAddressCountry() {
    return this.checkoutFormGroup.get('shippingAddress.country');
  }

  get billingAddressStreet() {
    return this.checkoutFormGroup.get('billingAddress.street');
  }
  get billingAddressCity() {
    return this.checkoutFormGroup.get('billingAddress.city');
  }
  get billingAddressState() {
    return this.checkoutFormGroup.get('billingAddress.state');
  }
  get billingAddressZipCode() {
    return this.checkoutFormGroup.get('billingAddress.zipCode');
  }
  get billingAddressCountry() {
    return this.checkoutFormGroup.get('billingAddress.country');
  }

  get creditCardType() {
    return this.checkoutFormGroup.get('creditCard.cardType');
  }
  get creditNameOnCard() {
    return this.checkoutFormGroup.get('creditCard.nameOnCard');
  }
  get creditCardNumber() {
    return this.checkoutFormGroup.get('creditCard.cardNumber');
  }
  get creditSecurityCode() {
    return this.checkoutFormGroup.get('creditCard.securityCode');
  }

  onSubmit() {
    console.log('Handling the submit button');

    if (this.checkoutFormGroup.invalid) {
      this.checkoutFormGroup.markAllAsTouched();
      return;
    }

    // set up order
    let order = new Order(this.totalPrice, this.totalQuantity);
    order.totalPrice = this.totalPrice;
    order.totalQuantity = this.totalQuantity;

    // get cart items
    const cartItems = this.cartService.cartItems;

    // create orderItems from cartItems
    // - long way
    /*
    let orderItems: OrderItem[] = [];
    for (let i=0; i < cartItems.length; i++) {
      orderItems[i] = new OrderItem(cartItems[i]);
    }
    */

    // - short way
    let orderItems: OrderItem[] = cartItems.map(
      (tempCartItem) => new OrderItem(tempCartItem)
    );

    // // set up purchase
    // let purchase = new Purchase(customer, shippingAddress, billingAddress, order, orderItems);

    // // populate purchase - customer
    // purchase.customer = this.checkoutFormGroup.controls['customer'].value;

    // // populate purchase - shipping address
    // purchase.shippingAddress = this.checkoutFormGroup.controls['shippingAddress'].value;
    // const shippingState: State = JSON.parse(JSON.stringify(purchase.shippingAddress.state));
    // const shippingCountry: Country = JSON.parse(JSON.stringify(purchase.shippingAddress.country));
    // purchase.shippingAddress.state = shippingState.name;
    // purchase.shippingAddress.country = shippingCountry.name;

    // // populate purchase - billing address
    // purchase.billingAddress = this.checkoutFormGroup.controls['billingAddress'].value;
    // const billingState: State = JSON.parse(JSON.stringify(purchase.billingAddress.state));
    // const billingCountry: Country = JSON.parse(JSON.stringify(purchase.billingAddress.country));
    // purchase.billingAddress.state = billingState.name;
    // purchase.billingAddress.country = billingCountry.name;

    // // populate purchase - order and orderItems
    // purchase.order = order;
    // purchase.orderItems = orderItems;
    
    // Extract customer, shippingAddress, and billingAddress from the form group
    let customer: Customer = this.checkoutFormGroup.controls['customer'].value;

    let shippingAddress =
      this.checkoutFormGroup.controls['shippingAddress'].value;
    const shippingState: State = JSON.parse(
      JSON.stringify(shippingAddress.state)
    );
    const shippingCountry: Country = JSON.parse(
      JSON.stringify(shippingAddress.country)
    );
    shippingAddress.state = shippingState.name;
    shippingAddress.country = shippingCountry.name;

    let billingAddress =
      this.checkoutFormGroup.controls['billingAddress'].value;
    const billingState: State = JSON.parse(
      JSON.stringify(billingAddress.state)
    );
    const billingCountry: Country = JSON.parse(
      JSON.stringify(billingAddress.country)
    );
    billingAddress.state = billingState.name;
    billingAddress.country = billingCountry.name;

    // set up purchase
    let purchase = new Purchase(
      customer,
      shippingAddress,
      billingAddress,
      order,
      orderItems
    );
    //compute payment info
    this.paymentInfo.amount = Math.round(this.totalPrice*100);
    this.paymentInfo.currency = 'USD';
    this.paymentInfo.receiptEmail = purchase.customer.email;
    //if valid form 
    //create card payment
    //place order
    if(!this.checkoutFormGroup.invalid && this.displayError.textContent === ""){
      this.isDisabled = true;
      this.checkoutService.createPaymentIntent(this.paymentInfo).subscribe(
        (paymentIntentResponse) => {
          this.stripe.confirmCardPayment(paymentIntentResponse.client_secret,
            {
              payment_method: {
                card: this.cardElement,
                billing_details:{
                  email: purchase.customer.email,
                  name: `${purchase.customer.firstName} ${purchase.customer.lastName}`,
                  address: {
                    linel: purchase.shippingAddress.street,
                    city: purchase.shippingAddress.city,
                    state: purchase.shippingAddress.state,
                    postal_code: purchase.shippingAddress.zipCode,
                    country: this.billingAddressCountry?.value.code
                  }
                }
              }
            }, {handleActin: false})
            .then((result:any) => {
              if(result){
                alert(`There was an error: ${result.error.message}`);
                this.isDisabled = false;
              }else{
                this.checkoutService.placeOrder(purchase).subscribe({
                  next: (response: any) => {
                    alert(`Your order has been placed. Your tracking number is ${response.orderTrackingNumber}`);
                    //reset cart
                    this.resetCart();
                    this.isDisabled = false;
                  },
                  error: (err: any) => {
                    alert(`There was an error: ${err.error.message}`);
                    this.isDisabled = false;
                  }
                })
              }
            })
        }
      )
    } else {
      this.checkoutFormGroup.markAllAsTouched();
      return;
    }

    // call REST API via the CheckoutService
    // this.checkoutService.placeOrder(purchase).subscribe({
    //   next: (response) => {
    //     alert(
    //       `Your order has been received.\nOrder tracking number: ${response.orderTrackingNumber}`
    //     );

    //     // reset cart
    //     this.resetCart();
    //   },
    //   error: (err) => {
    //     alert(`There was an error: ${err.message}`);
    //   },
    // });
  }

  resetCart() {
    // reset cart data
    this.cartService.cartItems = [];
    this.cartService.totalPrice.next(0);
    this.cartService.totalQuantity.next(0);
    this.cartService.persistCartItem();

    // reset the form
    this.checkoutFormGroup.reset();

    // navigate back to the products page
    this.router.navigateByUrl('/products');
  }

  copyShippingAddressToBillingAddress(event: Event) {
    if ((event.target as HTMLInputElement).checked) {
      this.checkoutFormGroup.controls['billingAddress'].setValue(
        this.checkoutFormGroup.controls['shippingAddress'].value
      );
    } else {
      this.checkoutFormGroup.controls['billingAddress'].reset();
    }
  }

  handleMonthAndYear() {
    const creditCardFormGroup = this.checkoutFormGroup.get('creditCard');
    const currentYear: number = new Date().getFullYear();
    const selectedYear: number = Number(
      creditCardFormGroup?.value.expirationYear
    );

    let startMonth: number;

    if (currentYear === selectedYear) {
      startMonth = new Date().getMonth() + 1;
    } else {
      startMonth = 1;
    }
    this.formService.getCreditCardMonths(startMonth).subscribe((data) => {
      this.creditCardMonths = data;
    });
  }

  getStates(formGroupName: string) {
    const formGroup = this.checkoutFormGroup.get(formGroupName)!;
    const countryCode = formGroup.value.country.code;
    const countryName = formGroup.value.country.name;

    console.log('countrycode' + countryCode);
    console.log('countryname' + countryName);

    this.formService.getState(countryCode).subscribe((data) => {
      if (formGroupName === 'shippingAddress') {
        this.shippingAddressStates = data;
      } else if (formGroupName === 'billingAddress') {
        this.billingAddressStates = data;
      }
      formGroup.get('state')?.setValue(data[0]);
    });
  }
}
