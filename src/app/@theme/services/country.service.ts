// country.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CountryService {

  private apiUrl = 'https://restcountries.com/v3.1/all?fields=name';

  constructor(private http: HttpClient) {}

  getCountries(): Observable<string[]> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return this.http.get<any[]>(this.apiUrl).pipe(
      map((countries) => countries.map(c => c.name.common))
    );
  }
}
