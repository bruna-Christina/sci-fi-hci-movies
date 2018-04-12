import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';
import { catchError, map, tap } from 'rxjs/operators';

import { environment } from '../environments/environment';

export interface Category{
  id?: number;
  name: string;
}
export interface Movie{
  id:number;
  name:string;
  plot:string;
  poster:string;
  imdb:string;
  year:number;
  categories:Category[];
}

@Injectable()
export class MoviesService {

  private static SERVICE_URL: string = environment.serviceUrl;

  constructor(
    private http: Http,
    private httpClient: HttpClient
  ) { }

  public getCategories():Promise<Category[]>{
    return this.http.get(MoviesService.SERVICE_URL+'categories')
      .toPromise()
      .then((response)=> {
        return response.json();
      });
      // .catch((err) => {
      //   console.error('Error getting categories ', err);
      // });
  }

  public addCategory(cat:Category):Promise<Category|{msg:string}>{
    return this.http.post(MoviesService.SERVICE_URL+'categories', cat)
      .toPromise()
      .then((response)=> {
        return response.json();
      });
      // .catch((err) => {
      //   console.error('Error adding categories ', err);
      // });
  }

  public getMovies():Promise<Movie[]>{
    return this.http.get(MoviesService.SERVICE_URL+'movies')
      .toPromise()
      .then((response)=> {
        return response.json();
      });
      // .catch((err) => {
      //   console.error('Error getting movies ', err);
      // });
  }

  public addMovie(mov:Movie):Promise<Movie|{msg:string}>{
    return this.http.post(MoviesService.SERVICE_URL+'movies', mov)
      .toPromise()
      .then((response)=> {
        return response.json();
      });
      // .catch((err) => {
      //   console.error('Error adding categories ', err);
      // });
  }

  private handleError<T> (operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed: ${error.message}`);
      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }

  public searchMovies(term: string): Observable<Movie[]> {
    if (!term.trim()) {
      // if not search term, return empty array.
      return of([]);
    }
    return this.httpClient.get<Movie[]>(`${MoviesService.SERVICE_URL}movies/search?name=${term}`).pipe(
      tap(_ => console.log(`found movies matching "${term}"`)),
      catchError(this.handleError<Movie[]>('searchMovies', []))
    );
  }

}
