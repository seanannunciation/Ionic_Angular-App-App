import { Component } from '@angular/core';

import { PostGetService } from '../services/post-get.service';
import { http } from '@angular/http';

import { map } from 'rxjs/operators';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  items: any=[];
  url: string;
  dataObject: string;


  constructor( public postGet: PostGetService ){

  }

  // ionViewDidLoad(){
  //   this.PostGetService.getData();
  // }

  getData(){
      // let postFormData = new FormData();
      // postFormData.append('url',this.url);
      // postFormData.append('data',this.dataObject);
      // let body={
      //   url: this.url,
      //   data: this.dataObject
      // }
      this.postGet.getData(this.url,this.dataObject)
      .subscribe(data => {
      // data.map((val) => console.log(val.title));
        this.items=data;
        console.log(this.items);
      });
  }


  postData(){
    let postFormData = new FormData();
    postFormData.append('url',this.url);
    postFormData.append('data',this.dataObject);
    let body={
      url: this.url,
      data: this.dataObject
    }
    this.postGet.postData(this.url,body)
      .subscribe(data => {
            this.items=data;
            console.log(this.items);
      });
  }

}
