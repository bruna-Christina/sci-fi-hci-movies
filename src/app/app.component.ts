import { Component } from '@angular/core';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import { Subject } from 'rxjs/Subject';
import { take, takeUntil } from 'rxjs/operators';
import { Observable } from 'rxjs/Observable';
import { of }         from 'rxjs/observable/of';
import {
  debounceTime, distinctUntilChanged, switchMap
} from 'rxjs/operators';
import { MatSnackBar } from '@angular/material';
import { FormControl } from '@angular/forms';
import { IonRangeSliderCallback } from 'ng2-ion-range-slider';
import { MatSelectChange } from '@angular/material/select';
import { MatDialog } from '@angular/material/dialog';
import { DialogCategoryComponent, CategoryDialogResponse } from './dialogs/dialog-category/dialog-category.component';
import { DialogMovieComponent, MovieDialogResponse } from './dialogs/dialog-movie/dialog-movie.component';
import { MoviesService, Movie, Category } from './movies.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  constructor(
    private moviesService:MoviesService,
    public matSnackBar:MatSnackBar,
    public dialog: MatDialog
  ) { }
  public loading: boolean = false;
  
  public categoryFormControl = new FormControl();
  public categoryFormControlFilter = new FormControl();
  public movieFormControl = new FormControl();
  public movieFormControlFilter = new FormControl();
  
  public movies:Movie[] = null;
  /** list of categories filtered by search keyword for multi-selection */
  public filteredMovies: ReplaySubject<Movie[]> = new ReplaySubject<Movie[]>(1);

  public categories:Category[] = [];
  /** list of categories filtered by search keyword for multi-selection */
  public filteredCategories: ReplaySubject<Category[]> = new ReplaySubject<Category[]>(1);
  /** Subject that emits when the component has been destroyed. */
  private _onDestroy = new Subject<void>();

  public minYear:number = 1970;//1895;
  public maxYear:number = new Date().getFullYear();
  
  public yearsFilter:number[] = [];
  public movieFilter:Movie[] = [];
  public categoryFilter: Category[] = [];

  private countLoad = 0;
  private disableLoad(max:number){
    this.countLoad++;
    if(this.countLoad === max){
      this.loading = false;
    }
  }

  private setYears(){
    let minY = this.movies[0].year;
    let maxY = this.movies[0].year;;
    this.movies.forEach((movie)=>{
      minY = Math.min(minY, movie.year);
      maxY = Math.max(maxY, movie.year);
    });
    this.minYear = minY;
    this.maxYear = maxY;
  }

  private sortList(list){
    list.sort(function(a,b){
      var nameA = a.name.toLowerCase();
      var nameB = b.name.toLowerCase();
      if(nameA < nameB) return -1;
      if(nameA > nameB) return 1;
      return 0;
    });
  }

  private filterCategoriesBySearch() {
    if (!this.categories) {
      return;
    }
    // get the search keyword
    let search = this.categoryFormControlFilter.value;
    if (!search) {
      this.filteredCategories.next(this.categories.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    // filter the categories
    this.filteredCategories.next(
      this.categories.filter(cat => cat.name.toLowerCase().indexOf(search) > -1)
    );
  }

  private filterMoviesBySearch() {
    if (!this.movies) {
      return;
    }
    // get the search keyword
    let search = this.movieFormControlFilter.value;
    if (!search) {
      this.filteredMovies.next(this.movies.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    // filter the movies
    this.filteredMovies.next(
      this.movies.filter(mov => mov.name.toLowerCase().indexOf(search) > -1)
    );
  }

  ngOnInit() {
    this.loading = true;
    this.moviesService.getMovies()
      .then((response)=>{
        this.disableLoad(2);
        this.movies = response;
        this.setYears();
        this.filteredMovies.next(this.movies.slice());
        // listen for search field value changes
        this.movieFormControlFilter.valueChanges
          .pipe(takeUntil(this._onDestroy))
          .subscribe(() => {
            this.filterMoviesBySearch();
          });
        console.log('movies', this.movies);
      })
      .catch((err) => {
        this.matSnackBar.open('Error getting movies.','Close', {
          duration: 2000,
        });
        this.disableLoad(2);
      });
    this.moviesService.getCategories()
      .then((response)=>{
        this.disableLoad(2);
        this.categories = response;
        this.filteredCategories.next(this.categories.slice());
        // listen for search field value changes
        this.categoryFormControlFilter.valueChanges
          .pipe(takeUntil(this._onDestroy))
          .subscribe(() => {
            this.filterCategoriesBySearch();
          });
        console.log('categories', this.categories);
      })
      .catch((err) => {
        this.matSnackBar.open('Error getting categories.','Close', {
          duration: 2000,
        });
        this.disableLoad(2);
      });
  }

  ngOnDestroy() {
    this._onDestroy.next();
    this._onDestroy.complete();
  }

  public changeYearRange(ionRangeSlider:IonRangeSliderCallback ){
    this.yearsFilter = [ionRangeSlider.from, ionRangeSlider.to];
  }
  public changeMovieSelection(matSel: MatSelectChange){
    this.movieFilter = matSel.value;
  }
  public changeCategorySelection(matSel: MatSelectChange){
    this.categoryFilter = matSel.value;
  }

  public openCategoryDialog() {
    let dialogRef = this.dialog.open(DialogCategoryComponent, {
      data: null
    });
    dialogRef.afterClosed().subscribe((dRes:CategoryDialogResponse) => {
      if(dRes && dRes.action){
        this.loading = true;
        this.moviesService.addCategory({name:dRes.name})
          .then((response:Category)=>{
            this.matSnackBar.open('Category added.','Close', {
              duration: 2000,
            });
            this.loading = false;
            this.categories.push(response);
            this.sortList(this.categories);
            this.filteredCategories.next(this.categories.slice());
          })
          .catch((err) => {
            this.matSnackBar.open('Error on adding category.','Close', {
              duration: 2000,
            });
            this.loading = false;
          });
      }
    });
  }

  public openMovieDialog() {
    let dialogRef = this.dialog.open(DialogMovieComponent, {
      data: {categories:this.categories}
    });
    dialogRef.afterClosed().subscribe((dRes:MovieDialogResponse) => {
      console.log('>>> movie Dialog', dRes);
      if(dRes && dRes.action){
        this.loading = true;
        this.moviesService.addMovie(dRes.movie)
          .then((response:Movie)=>{
            this.matSnackBar.open('Movie added.','Close', {
              duration: 2000,
            });
            this.loading = false;
            this.movies.push(response);
            this.sortList(this.movies);
            this.setYears();
            this.filteredMovies.next(this.movies.slice());
          })
          .catch((err) => {
            this.matSnackBar.open('Error on adding Movie.','Close', {
              duration: 2000,
            });
            this.loading = false;
          });
      }
    });
  }
}
