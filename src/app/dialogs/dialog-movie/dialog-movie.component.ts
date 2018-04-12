import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { FormControl, FormGroupDirective, NgForm, Validators } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatSelectChange } from '@angular/material/select';

import { Subject } from 'rxjs/Subject';
import { take, takeUntil } from 'rxjs/operators';
import { Observable } from 'rxjs/Observable';
import { of }         from 'rxjs/observable/of';
import {
  debounceTime, distinctUntilChanged, switchMap
} from 'rxjs/operators';

import { MoviesService, Movie, Category } from '../../movies.service';

/** Error when invalid control is dirty, touched, or submitted. */
class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}

export interface MovieDialogResponse{
  action:boolean;
  movie:Movie;
}

@Component({
  selector: 'app-dialog-movie',
  templateUrl: './dialog-movie.component.html',
  styleUrls: ['./dialog-movie.component.scss']
})
export class DialogMovieComponent implements OnInit {

  constructor(
    private moviesService:MoviesService,
    public dialogRef: MatDialogRef<DialogMovieComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {categories:Category[]}
  ) { }

  private searchTerms = new Subject<string>();

  public selectedMovie:Movie = null;
  public selectedCategories:Category[] = null;
  public searchmovies: Observable<Movie[]>;

  public movieFormControl:FormControl = new FormControl('', [
    Validators.required,
  ]);
  public categoryFormControl:FormControl = new FormControl('', [
    Validators.required,
  ]);

  public matcher = new MyErrorStateMatcher();

  ngOnInit() {
    this.searchmovies = this.searchTerms.pipe(
      // wait 300ms after each keystroke before considering the term
      debounceTime(300),
      // ignore new term if same as previous term
      distinctUntilChanged(),
      // switch to new search observable each time the term changes
      switchMap((term: string) => this.moviesService.searchMovies(term)),
    );
  }

  public setMovieSelected(selMovie:Movie){
    this.selectedMovie = selMovie;
  }

  public changeCategorySelection(matSel: MatSelectChange){
    this.selectedCategories = matSel.value;
  }

  // Push a search term into the observable stream.
  public search(term: string): void {
    this.selectedMovie = null;
    this.searchTerms.next(term);
  }

  public confirmSelection(btnAction: boolean) {
    if(btnAction && (this.movieFormControl.errors !== null || this.categoryFormControl.errors !== null)){
      this.selectedMovie = null;
      return;
    }
    if(this.selectedMovie!== null){
      this.selectedMovie.categories = this.selectedCategories;
    }
    const response: MovieDialogResponse = {
      action:btnAction,
      movie:this.selectedMovie
    }
    this.dialogRef.close(response);
  }

}
