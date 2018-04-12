import { Pipe, PipeTransform } from '@angular/core';
import { Movie } from '../movies.service';

@Pipe({
  name: 'yearFilter'
})
export class YearFilterPipe implements PipeTransform {

  transform(movieList: Movie[], yearInterval: number[]): any {
    if(yearInterval.length > 0){
      return movieList.filter((movie)=>{
        return yearInterval[0] <= movie.year && yearInterval[1] >= movie.year;
      });
    }
    return movieList;
  }

}
