//declare var cordova:any;
import { Component } from '@angular/core';
import { IonicPage } from 'ionic-angular';
import { NavController } from 'ionic-angular';
import { NavParams } from 'ionic-angular';
import { Events } from 'ionic-angular';
import { AlertController } from 'ionic-angular';
import {
	HttpEvent, HttpInterceptor, HttpHandler, HttpRequest,
	HttpClient, HttpErrorResponse, HttpHeaders, HttpParams
} from '@angular/common/http';
import { URLSearchParams } from '@angular/http';
import { Headers } from '@angular/http';
import { LoadingController } from 'ionic-angular';
import { Subscription } from "rxjs/Subscription";
import { Platform } from 'ionic-angular';

//Importing the PostGet Service ad http
import { PostGetService } from '../services/post-get.service';
import { http } from '@angular/http';

export interface RequestOptions {
	headers?: HttpHeaders;
  	observe?: 'body';
  	params?: HttpParams;
  	reportProgress?: boolean;
  	responseType?: 'json';
  	withCredentials?: boolean;
	body?: any;
}


/* second edition */
import { Validators, FormBuilder, FormGroup, FormControl } from '@angular/forms';
function validator_email(c: FormControl): any {
	let re = new RegExp(/^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i);
	return re.test(c.value) ? null : { invalidEmail: true }
}


import {
	LoginProvider,
	UserProvider,
	UaProvider,
} from '../../providers/providers';


@IonicPage()
@Component({
	selector: 'page-login2',
	templateUrl: 'login2.html',
})
export class Login2Page {
	private username: string;
	private password: string;
	public baseUri;
	private userId;
	private name;
	private profilePictureUri;
	private headers;
	private oneSignalUID;
	private oneSignalPT;
	private loading;
	private loginUserCall: Subscription;
	public parentPage;
	public firstLogin;

	/* second edition */
	private formLogin2: FormGroup;

	constructor(
		public navCtrl: NavController,
		public navParams: NavParams,
		private alertCtrl: AlertController,
		private events: Events,
		private loadingCtrl: LoadingController,
		public platform: Platform,
		public http: HttpClient, //Replaced the usage of http with the service provider

		/* second edition */
		private formBuilder: FormBuilder,
		private loginProvider: LoginProvider,
		private userProvider: UserProvider,
		private uaProvider:UaProvider,
	) {
		//cordova.plugins.Keyboard.disableScroll(true);

		this.username = this.navParams.data.username
		let password = ""//"12345678"
		this.formLogin2 = this.formBuilder.group({
			username: [this.username, validator_email],
			password: [password, Validators.compose([Validators.required, Validators.minLength(1)])],
		});
	}
	ionViewDidLoad() {
		console.log('ionViewDidLoad Login2Page');
		this.baseUri = JSON.parse(localStorage.getItem("baseUri"));
	}
	forgotPassword(): void {
		this.navCtrl.push('ForgetPasswordPage', {username: this.username});
	}
	back(): void {
		this.navCtrl.setRoot('LoginPage');
	}
	showAlertMessage(title: string, subTitle: string, buttons: [string]): void {
		let alert = this.alertCtrl.create({
			title: title,
			subTitle: subTitle,
			buttons: buttons
		});
		alert.present();
	}
	processForm(): void {
		if (this.formLogin2.valid) {
			this.loading = this.loadingCtrl.create({
				content: 'Signing In..'
			});
			this.loading.present();
			let data = new FormData();//let data = new URLSearchParams();


			this.headers = new Headers();
			this.headers.append('Content-Type', 'application/x-www-form-urlencoded');

			data.append('userName', this.formLogin2.value.username);
			data.append('password', this.formLogin2.value.password);


			data.append('oneSignalUID', this.oneSignalUID);
			data.append('oneSignalPT', this.oneSignalPT);
			JSON.parse(JSON.stringify(data || null));

			//Created an Object with the ForData values as FormData returns an empty object
			let values={
				userName: this.formLogin2.value.username,
				password: this.formLogin2.value.password,
				oneSignalUID: this.oneSignalUID,
				oneSignalPT: this.oneSignalPT
			}

			//Edited http.post call to call the Service PostGetService

			// this.loginUserCall = this.http
			// 	.post(this.baseUri + 'loginUser', data)
			// 	.subscribe((data:any) => {
			// this.loginUserCall = this.postGet.postData(this.baseUri + 'loginUser', data)
			this.loginUserCall = this.postGet.postData(this.baseUri + 'loginUser', values)
				.subscribe((data:any) => {
					let status = data.Status

					if (status == 200) {
						if (data.message != "Invalid Credentials") {

							this.userId = data.userId;
							this.profilePictureUri = data.profilePictureUri;

							this.name = data.name;
							this.firstLogin = data.firstLogin;

							let subscriptionStatus = data.subscriptionStatus;
							let appAllowed = data.appAllowed;
							let userWithPlan = data.userWithPlan;

							let profilePicUri;
							if (data.profilePictureUri) {
								profilePicUri = data.profilePictureUri;
							}
							else {
								profilePicUri = "assets/imgs/avatarProfilePictureDefault.png";
							}
							localStorage.setItem("profilePictureUri", JSON.stringify(this.profilePictureUri));
							localStorage.setItem("nameOfUser", JSON.stringify(this.name));

							this.events.publish('sideMenuData', profilePicUri, this.name);




							this.userProvider.setUser({
								userId: this.userId,
								name: this.name,
								profilePictureUri: this.profilePictureUri,
								subscriptionStatus: subscriptionStatus,
							}).subscribe(() => {
								this.loading.dismiss();

								this.uaProvider.registered()
								.subscribe(()=>{
									console.error("[UA] registered")
								}, (err)=>{

								})


								if (userWithPlan == "Yes") {
									//user has subscription, check validity
									if (subscriptionStatus == "active" || subscriptionStatus == "trialing") {


										this.uaProvider.subscribe()
										.subscribe(()=>{

										}, (err)=>{

										})


										this.events.publish('sideMenuHideOption', "No");
										if (this.firstLogin == 1) {
											this.navCtrl.push('AppIntroductionPage', {
												userId: this.userId
											});
										}
										else {
											this.navCtrl.push('HomePage');
										}
									}
									else {


										this.uaProvider.unsubscribe()
										.subscribe(()=>{

										}, (err)=>{

										})

										if (appAllowed == "Invalid") {
											this.showAlertMessage("Uh oh!", "No active subscription found on this account, please subscribe to get one free appetizer redemption daily.", ['OK']);
											this.navCtrl.push('PurchaseSubscriptionPage');
										}
										else if (appAllowed == "Valid") {
											if(subscriptionStatus == "canceled" ){
												this.events.publish('sideMenuHideOption', "Yes");
											}
											this.navCtrl.push('HomePage');
										}


									}
								} // No Active plan so let user try the app
								else {

									this.uaProvider.unsubscribe()
									.subscribe(()=>{

									}, (err)=>{

									})

									this.events.publish('sideMenuHideOption', "Yes");
									if (this.firstLogin == 1) {
										this.navCtrl.push('AppIntroductionPage', {
											userId: this.userId
										});
									}
									else {
										this.navCtrl.push('HomePage');
									}
								}
							}, error => {
								this.loading.dismiss();

								console.error('Error storing user', error)
							});
						}
						else {
							this.loading.dismiss();
							this.showAlertMessage("ERROR!", "Your email and/or password are incorrect. Please try again.", ['OK']);

						}
					}
				}, error => {
					this.loading.dismiss();
					this.showAlertMessage("ERROR!", "Unable to Login. Please check your internet connection.", ['OK']);
				});
		} else {
			this.showAlertMessage("SORRY!", "Username and password fields can not be empty", ['Ok'])
		}
	}


}
