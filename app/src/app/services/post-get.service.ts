import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions } from '@angular/http';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs/Observable';

@Injectable({
  providedIn: 'root'
})
export class PostGetService {

  data: Observable<any>;

  constructor(public http:Http ) {

   }

   getData(urlInput,values){
     // let params=values.map(res => )

     let url=urlInput;
     let headers= new Headers();
     headers.append('Content-Type', 'application/x-www-form-urlencoded');
     // let url='https://jsonplaceholder.typicode.com/posts';
     let getFormData=new FormData();

     this.data = this.http.get(url,values, {headers:headers}).pipe(
       map(res => res.json()))

       return this.data;
   }


   postData(urlInput,values){
     // let url='https://jsonplaceholder.typicode.com/posts';
     let url = urlInput;
     let headers= new Headers();
     headers.append('Content-Type', 'application/x-www-form-urlencoded');
     console.log(values);
     this.data = this.http.post(url,values, {headers:headers}).pipe(
       map(res => res.json())
     )
        return this.data;
   }
}
