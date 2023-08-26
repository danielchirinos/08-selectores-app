import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Country, Region, SmallCountry } from '../interfaces/contry.interface';
import { Observable, catchError, combineLatest, map, of, tap } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class CountriesService {

    private basicUrl: string = 'https://restcountries.com/v3.1';

    private _regions: Region[] = [ Region.Africa, Region.Americas, Region.Asia, Region.Europe, Region.Oceania ];

    constructor(private http: HttpClient) { }


    get regions(): Region[]{
        return [ ...this._regions ];
    }

    getCountriesByRegion( region:Region ):Observable<SmallCountry[]>{

        if(!region) return of([]);
        
        const url: string = `${ this.basicUrl }/region/${ region }?fields=cca3,name,borders`
        return this.http.get<Country[]>(url)
        .pipe(
            map( countries => countries.map( country => ({
                name: country.name.common,
                cca3: country.cca3,
                borders: country.borders ?? []
            }))),
            catchError(( err => of([]) )),
        );

        // return of([])

    }
    
    getCountriesByAlphaCode( alpahCode: string ):Observable<SmallCountry>{

        if(!alpahCode) return of();
        
        const url: string = `${ this.basicUrl }/alpha/${ alpahCode }?fields=cca3,name,borders`
        return this.http.get<Country>(url)
        .pipe(
            map( country => ({
                name: country.name.common,
                cca3: country.cca3,
                borders: country.borders ?? []
            })),
            catchError(( err => of() )),
        );
        // return of([])

    }

    getCountryBordersByCodes( borders: string[]): Observable<SmallCountry[]>{

        if(!borders || borders.length === 0 ) return of([])

        const contriesRequest: Observable<SmallCountry>[] = []

        borders.forEach( code => {
            const request = this.getCountriesByAlphaCode( code );
            contriesRequest.push( request )
        })

        // cuando el combineLatest se llame por el suscribe, se dispara hasta que contriesRequest tenga todos valor como un observable
        return combineLatest( contriesRequest )

        // return contryRequest;
    }


}




