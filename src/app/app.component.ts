import { Component, ViewChild } from '@angular/core';
import {  NgForm } from '@angular/forms';
import { IUser } from "./user.model";
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { map } from "rxjs/operators";
import { ToastrService } from "ngx-toastr";
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent {
  title = 'ng-crud';

  ngOnInit(){
      // console.log("tp");
    this.fetchUser();
  }


  users:Array<any> = [];
  userList:any;
  url:string = "https://ngcrud-1ad88.firebaseio.com/user.json";
  userId:string;
  userName:string;
  userTech:string;
  editMode:boolean = false;

  @ViewChild('userForm') userForm:NgForm;

  constructor(private http:HttpClient, private toastr:ToastrService){}
  
  
  onAddUser(userData:IUser){

    if(this.editMode){
      this.http.put('https://ngcrud-1ad88.firebaseio.com/user/'+this.userId+'.json', userData).subscribe(
        (res) => {
          this.toastr.success('User Updated Successfully');
          this.fetchUser(); 
        }
      )
      this.editMode = false;
      this.userForm.resetForm();
    }

    else{
            if (this.userForm.valid) {
              console.log(userData.name,userData.tech);
              this.users.push(userData);
              this.http.post<IUser>(this.url, userData).subscribe( 
                (response) =>{
                  // console.log(response);
                  this.toastr.success('User Added Succesfully')
                  this.fetchUser();      
                },
                (err:HttpErrorResponse)=>{
                  this.toastr.error(err.message);
                }
              );
              this.userForm.resetForm();
              
            }
            else{
              // console.log(this.userForm);
              let key=Object.keys( this.userForm.controls);
              // console.log(key);
              key.filter(
                data => {
                  // console.log(data);
                  let control = this.userForm.controls[data];
                  console.log(control);
                  if (control.errors != null) {
                    control.markAsTouched();
                  } 
                }
              )
            }
    }

    
  }

  fetchUser(){
    
    // this.http.get<IUser>(this.url).subscribe(
    //   data => {
    //     this.userList = data;
    //     console.log(this.userList);        
    //   },
    //   (err:HttpErrorResponse)=>{
    //     console.log(err.message);
    //   }
    //   );

    this.http.get<IUser>(this.url).pipe(
      map ( 
        resData => {
          // console.log(resData) ;
          const userArray = [];
          for( const key in resData){
            // console.log(resData.hasOwnProperty(key));
            if(resData.hasOwnProperty(key)){
            // console.log(key);
            // console.log(resData[key]);             
            userArray.push({userId:key, ...resData[key]})
            }
          }
          return userArray;
        }
      )
    ).subscribe(
      data => {
        this.userList = data;
        // console.log(this.userList);
      },
      (err:HttpErrorResponse)=>{
        this.toastr.error(err.message);
      }
    )
  }

  onEditUser(uId:string, index:number){
    // console.log(id);
    this.userId = uId;
    this.userName = this.userList[index].name;
    this.userTech = this.userList[index].tech;
    this.userForm.setValue({
      name: this.userName,
      tech: this.userTech
    })
    // console.log(this.userList[index],this.userName, this.userTech);
    this.editMode = true;
  }

  onDeleteUser(uId:string){
    this.http.delete('https://ngcrud-1ad88.firebaseio.com/user/'+uId+'.json').subscribe(
      (res) => {
        this.toastr.warning("User Deleted Successfully");
        this.fetchUser();  
      },
      (err:HttpErrorResponse)=>{
        this.toastr.error(err.message);
      }
    )
  }
}
