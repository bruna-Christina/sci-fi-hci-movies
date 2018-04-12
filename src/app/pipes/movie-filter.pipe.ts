import { Pipe, PipeTransform } from '@angular/core';
import { Movie } from '../movies.service';

@Pipe({
  name: 'movieFilter'
})
export class MovieFilterPipe implements PipeTransform {

  transform(movieList: Movie[], movieSelected: Movie[]): any {
    if(movieSelected.length > 0){
      return movieSelected;
    }
    return movieList;
  }

}
