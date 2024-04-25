import { ActivatedRoute } from '@angular/router';
import { Product } from '../../common/product';
import { ProductService } from './../../services/product.service';
import { Component } from '@angular/core';
import { CartItem } from '../../common/cart-item';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.css'
})
export class ProductListComponent {

  products: Product[] = [];
  currentCategoryId: number = 1;
  searchMode: boolean = false;
  previousCategoryId: number = 1;

  //new properties for paginaiton
  thePageNumber: number =1;
  thePageSize: number = 5;
  theTotalElement: number =0;

  previousKeyword: string = "";

  constructor(private ProductService: ProductService,
    private cartService: CartService,
    private route: ActivatedRoute
    ){}

  ngOnInit():void {
    this.route.params.subscribe(() => {
    this.listProduct()
  });
  }

  listProduct() {
    this.searchMode = this.route.snapshot.paramMap.has('keyword')
    if(this.searchMode){
      this.handleSearchProduct();
    }else{
      this.handleListProducts();
    }

  }
  handleSearchProduct() {
    const theKeyword: string = this.route.snapshot.paramMap.get('keyword')!;

    if (this.previousKeyword != theKeyword) {
      this.thePageNumber = 1;
    }

    this.previousKeyword = theKeyword;

    this.ProductService.searchProductPaginate(this.thePageNumber - 1,
      this.thePageSize,
      theKeyword).subscribe(this.processResult());
  }

  handleListProducts() {

    // check if "id" parameter is available
    const hasCategoryId: boolean = this.route.snapshot.paramMap.has('id');

    if (hasCategoryId) {
      // get the "id" param string. convert string to a number using the "+" symbol
      this.currentCategoryId = +this.route.snapshot.paramMap.get('id')!;
    }
    else {
      // not category id available ... default to category id 1
      this.currentCategoryId = 1;
    }


    // Check if we have a different category than previous

    // if we have a different category id than previous
    // then set thePageNumber back to 1
    if (this.previousCategoryId != this.currentCategoryId) {
      this.thePageNumber = 1;
    }

    this.previousCategoryId = this.currentCategoryId;

    console.log(`currentCategoryId=${this.currentCategoryId}, thePageNumber=${this.thePageNumber}`);

    // now get the products for the given category id
    this.ProductService.getProductListPaginate(this.thePageNumber - 1,
                                               this.thePageSize,
                                               this.currentCategoryId)
                                               .subscribe(
                                                data => {
                                                  this.products = data._embedded.products;
                                                  this.thePageNumber = data.page.number + 1;
                                                  this.thePageSize = data.page.size;
                                                  this.theTotalElement = data.page.totalElements;
                                                }
                                               );
  }

  updatePageSize(pageSize: string) {
    this.thePageSize = +pageSize;
    this.thePageNumber = 1;
    this.listProduct();
  }

  processResult() {
    return (data: any) => {
      this.products = data._embedded.products;
      this.thePageNumber = data.page.number + 1;
      this.thePageSize = data.page.size;
      this.theTotalElement = data.page.totalElements;
    };
  }

  addToCart(theProduct: Product) {
    console.log(theProduct.name)
    console.log(theProduct.unitPrice)
    const theCartItem = new CartItem(theProduct)

    this.cartService.addToCart(theCartItem)
    }
}
