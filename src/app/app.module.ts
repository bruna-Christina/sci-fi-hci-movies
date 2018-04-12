import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { HttpModule } from '@angular/http';
import { HttpClientModule }    from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonRangeSliderModule } from 'ng2-ion-range-slider';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';

import { 
  MatToolbarModule, MatIconModule, MatGridListModule,
  MatSnackBarModule, MatDialogModule, MatListModule, MatAutocompleteModule,
  MatCardModule, MatButtonModule, MatProgressSpinnerModule, MatChipsModule,
  MatFormFieldModule, MatInputModule, MatCheckboxModule , MatSelectModule
} from '@angular/material';

import { MoviesService } from './movies.service';

import { AppComponent } from './app.component';
import { LoadingComponent } from './shared/loading/loading.component';
import { MovieFilterPipe } from './pipes/movie-filter.pipe';
import { CategoryFilterPipe } from './pipes/category-filter.pipe';
import { YearFilterPipe } from './pipes/year-filter.pipe';
import { DialogCategoryComponent } from './dialogs/dialog-category/dialog-category.component';
import { DialogMovieComponent } from './dialogs/dialog-movie/dialog-movie.component';

@NgModule({
  declarations: [
    AppComponent,
    LoadingComponent,
    MovieFilterPipe,
    CategoryFilterPipe,
    YearFilterPipe,
    DialogCategoryComponent,
    DialogMovieComponent
  ],
  imports: [
    BrowserModule, BrowserAnimationsModule, 
    HttpModule, HttpClientModule, FormsModule, ReactiveFormsModule,
    IonRangeSliderModule, NgxMatSelectSearchModule, MatGridListModule,
    MatToolbarModule, MatIconModule, MatListModule, MatAutocompleteModule,
    MatSnackBarModule, MatDialogModule, MatChipsModule,
    MatCardModule, MatButtonModule, MatProgressSpinnerModule,
    MatFormFieldModule, MatInputModule, MatCheckboxModule, MatSelectModule
  ],
  entryComponents:[DialogCategoryComponent, DialogMovieComponent],
  providers: [MoviesService],
  bootstrap: [AppComponent]
})
export class AppModule { }
