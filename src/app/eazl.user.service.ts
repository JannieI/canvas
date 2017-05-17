import { Http } from '@angular/http';
import { Injectable } from '@angular/core';
import { Observable }  from 'rxjs/Observable';
import { BehaviorSubject }  from 'rxjs/BehaviorSubject';
import { EazlService } from './eazl.service';


// Token came along for now.
export interface Token {
	token: string;
}

export interface User {
    pk: number;
    username: string;
    first_name: string;
    last_name: string;
    email: string;
    password: string;
    is_superuser: boolean;
    is_staff: boolean;
    is_active: boolean;
    date_joined: Date;
    last_login: Date;
}


@Injectable()
export class EazlUserService {
	user: BehaviorSubject<User>;
	authToken: BehaviorSubject<Token>;

	constructor(
		private eazl: EazlService)
	{
		// Null for now
		var user: User = null;
		var token: Token = null;

		this.user = new BehaviorSubject(user);
		this.authToken = new BehaviorSubject(token);
	}

	refresh() {
		this.eazl.get<User>('users/authenticated-user').subscribe(
			user => {
				this.user.next(user);
			},
			error => {
				this.clearAuthToken();
				console.log(JSON.parse(error));
			}
		);
	}

	get hasAuthToken(): boolean {
		return this.authToken.getValue() != null;
	}

	clearAuthToken() {
		window.sessionStorage.removeItem('canvas-token');

		this.authToken.next(null);
	}

	authenticate(username: string, password: string) {
		this.eazl.post<Token>('auth-token', {username: username, password: password}).subscribe(
		    authToken => {
		        window.sessionStorage.setItem('canvas-token', authToken.token);
		        
		        this.authToken.next(authToken);
		        this.eazl.setAuthToken(authToken.token);
		        
		        this.refresh();
		    },
		    error => {
		        this.clearAuthToken();
		        console.log(JSON.parse(error));
		    }
		);
	}

}