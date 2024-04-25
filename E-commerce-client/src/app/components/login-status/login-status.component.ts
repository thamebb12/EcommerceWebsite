import { Component, Inject } from '@angular/core';
import { OKTA_AUTH, OktaAuthStateService } from '@okta/okta-angular';
import { OktaAuth } from '@okta/okta-auth-js';

@Component({
  selector: 'app-login-status',
  templateUrl: './login-status.component.html',
  styleUrl: './login-status.component.css'
})
export class LoginStatusComponent {
  isAuthenticated?: boolean = false;
  userFullName: string = '';

  storage: Storage = sessionStorage;

  constructor(private oktaAuthservice: OktaAuthStateService,
    @Inject(OKTA_AUTH) private oktaAuth: OktaAuth) {}

  ngOnInit():void {
    //subscibe to authentication state changes
    this.oktaAuthservice.authState$.subscribe(
      (result) => {
        this.isAuthenticated = result.isAuthenticated;
        this.getUserDetails()
      }
    )
  }
  getUserDetails() {
    if (this.isAuthenticated){
      this.oktaAuth.getUser().then(
        (res) => {
          this.userFullName = res.name as string;

          //retrieve the user email from authentication response
          const theEmail = res.email
          //store the email in browser storage
          this.storage.setItem('userEmail', JSON.stringify(theEmail))
        }
      )
    }
  }

  logout(){
    this.oktaAuth.signOut()
  }
}
