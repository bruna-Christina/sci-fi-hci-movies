import { Pipe, PipeTransform } from '@angular/core';
import { Movie, Category } from '../movies.service';

@Pipe({
  name: 'categoryFilter'
})
export class CategoryFilterPipe implements PipeTransform {

  transform(movieList: Movie[], catSelected: Category[]): any {
    if(catSelected.length > 0){
      let movieListfilter = movieList.filter((movie)=>{
        let hasCat = false;
        movie.categories.forEach((movCat)=>{
          catSelected.forEach((cat)=>{
            if(movCat.id === cat.id){
              hasCat = true;
            }
          });
        });
        return hasCat;
      });
      return movieListfilter;
    }
    return movieList;
  }

}
