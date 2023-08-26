import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CountriesService } from '../../services/countries.service';
import { Region, SmallCountry, Country } from '../../interfaces/contry.interface';
import { Observable, Subject, filter, switchMap, takeUntil, tap } from 'rxjs';

@Component({
    templateUrl: './selector-page.component.html',
    styles: []
})
export class SelectorPageComponent implements OnInit, OnDestroy {

    public countriesByRegion: SmallCountry[] = [];
    public borders: SmallCountry[] = [];
    private $region = new Subject<void>();
    private $country = new Subject<void>();
 
    public myForm: FormGroup = this.fb.nonNullable.group({
        region: ["", Validators.required ],
        country: ["", Validators.required],
        border: ["", Validators.required],
    })


    constructor(private fb: FormBuilder, private countriesService: CountriesService){}    

    ngOnInit(): void {
        // this.myForm.get('region')?.setValue(Region.Europe);
        this.onRegionChanged()
        this.onCountriesChanged()
    }
    
    onRegionChanged():void{ 
        this.myForm.get("region")!.valueChanges
        .pipe(
            tap( () => this.myForm.get("country")!.setValue("") ),
            tap( () => this.borders = [] ),
            // this.miFormulario.get('pais')?.reset('');
            // switchMap(this.countriesService.getCountriesByRegion ) -> manera simplificada, asume que se enviara ese dato en el parametro del servicio
            switchMap( region => this.countriesService.getCountriesByRegion(region) ),
            takeUntil(this.$region)
        )
        .subscribe( countries => {
            this.countriesByRegion = countries
        }) 
    }

    onCountriesChanged():void{ 
        this.myForm.get("country")!.valueChanges
        .pipe(
            tap( () => this.myForm.get("border")!.setValue("") ),
            filter( (value:string) => value.length > 0 ), //si el valor que regresa el valueChangues es true, sigue, si no lo filtra hasta aqui
            switchMap( alphaCode => this.countriesService.getCountriesByAlphaCode( alphaCode ) ), // este switch traer el codigo de frontera de cada pais
            switchMap( country => this.countriesService.getCountryBordersByCodes( country.borders! ) ), // este switch trae los nombres del codigo del switch anterior
            takeUntil(this.$country)
        )
        .subscribe( contries => {
            this.borders = contries
            
        }) 
    }


    get regions(): Region[]{ 
        return this.countriesService.regions
    }

    ngOnDestroy(): void {
        this.$region.unsubscribe()
        this.$country.unsubscribe()
    }

    onSubit():void {

    }
}
