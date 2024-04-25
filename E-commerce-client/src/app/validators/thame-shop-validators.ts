import { FormControl, ValidationErrors } from '@angular/forms';

export class ThameShopValidators {
  //whitespace validators
  static notOnlyWhitespace(control: FormControl): ValidationErrors{
    //check if contain whites spaces
    if (control['value'] != null && control['value'].trim().length === 0) {
        //invalid, return error object
        return { 'notOnlyWhitespace': true };
    }else{
        //valid return null
        return {}; 
    }
  }
}
