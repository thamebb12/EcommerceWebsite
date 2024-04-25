import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map, of } from 'rxjs';
import { Country } from '../common/country';
import { State } from '../common/state';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class FormService {

  private countriesUrl = environment.ApiUrl + '/countries'
  private statesUrl = environment.ApiUrl + '/states'

  constructor(
    private http: HttpClient
  ) {}

  getCountries(): Observable<Country[]> {
    return this.http.get<GetResponseCountries>(this.countriesUrl).pipe(
      map(reponse => reponse._embedded.countries)
    )
  }

  getState(theCountryCode: string): Observable<State[]> {
    const searchStatesUrl = `${this.statesUrl}/search/findByCountryCode?code=${theCountryCode}`;
    return this.http.get<GetResponseStates>(searchStatesUrl).pipe(
      map(reponse => reponse._embedded.states)
    )
  }

  // getCreditCardMonths(startMonth: number): Observable<number[]> {
  //   let data: number[] = [];

  //   for (let theMonth = startMonth; theMonth <= 12; theMonth++) {
  //     data.push(theMonth);
  //   }
  //   // of operator will wrap an object as Observable
  //   return of(data);
  // }

  // getCreditCardYears(): Observable<number[]> {
  //   let data: number[] = [];

  //   const startYear: number = new Date().getFullYear();
  //   const endYear: number = startYear + 10;

  //   for (let theYear = startYear; theYear <= endYear; theYear++) {
  //     data.push(theYear);
  //   }
  //   return of(data);
  // }

  getCreditCardMonths(startMonth: number): Observable<number[]> {

    let data: number[] = [];
    
    // build an array for "Month" dropdown list
    // - start at current month and loop until 

    for (let theMonth = startMonth; theMonth <= 12; theMonth++) {
      data.push(theMonth);
    }

    return of(data);
  }

  getCreditCardYears(): Observable<number[]> {

    let data: number[] = [];

    // build an array for "Year" downlist list
    // - start at current year and loop for next 10 years
    
    const startYear: number = new Date().getFullYear();
    const endYear: number = startYear + 10;

    for (let theYear = startYear; theYear <= endYear; theYear++) {
      data.push(theYear);
    }

    return of(data);
  }
}

interface GetResponseCountries {
  _embedded: {
    countries: Country[]
  }
}

interface GetResponseStates {
  _embedded: {
    states: State[]
  }
}