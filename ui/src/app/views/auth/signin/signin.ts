import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthDriverManifest } from 'app/model/authentication.model';
import { AuthenticationService } from 'app/service/authentication/authentication.service';
import { finalize } from 'rxjs/operators/finalize';

@Component({
    selector: 'app-auth-signin',
    templateUrl: './signin.html',
    styleUrls: ['./signin.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SigninComponent implements OnInit {
    loading: boolean;
    redirect: string;
    mfa: boolean;
    apiURL: string;

    isFirstConnection: boolean;
    localDriver: AuthDriverManifest;
    ldapDriver: AuthDriverManifest;
    externalDrivers: Array<AuthDriverManifest>;
    showSuccessSignup: boolean;
    localSigninActive: boolean;
    localSignupActive: boolean;
    ldapSigninActive: boolean;

    constructor(
        private _authenticationService: AuthenticationService,
        private _router: Router,
        private _route: ActivatedRoute,
        private _cd: ChangeDetectorRef
    ) {
        this.loading = true;
        this._route.queryParams.subscribe(queryParams => {
            this.redirect = queryParams.redirect;
            this.mfa = false;
            this._cd.markForCheck();
        });
    }

    ngOnInit() {
        this._authenticationService.getDrivers()
            .pipe(finalize(() => {
                this.loading = false;
                this._cd.markForCheck();
            }))
            .subscribe((data) => {
                this.isFirstConnection = data.is_first_connection;
                this.localDriver = data.manifests.find(d => d.type === 'local');
                this.ldapDriver = data.manifests.find(d => d.type === 'ldap');
                this.externalDrivers = data.manifests
                    .filter(d => d.type !== 'local' && d.type !== 'ldap' && d.type !== 'builtin')
                    .sort((a, b) => a.type < b.type ? -1 : 1)
                    .map(d => {
                        d.icon = d.type === 'corporate-sso' ? 'shield alternate' : d.type;
                        return d;
                    });

                if (this.localDriver && this.isFirstConnection) {
                    this.localSignupActive = true;
                } else if (this.localDriver) {
                    this.localSigninActive = true;
                } else if (this.ldapDriver) {
                    this.ldapSigninActive = true;
                }
            });
    }

    clickShowLocalSignin() {
        this.localSigninActive = true;
        this.localSignupActive = false;
        this.ldapSigninActive = false;
        this._cd.markForCheck();
    }

    clickShowLocalSignup() {
        /*this.passwordShowError = false;
        this.passwordLevel = null;*/
        this.showSuccessSignup = false;
        this.localSigninActive = false;
        this.localSignupActive = true;
        this.ldapSigninActive = false;
        this._cd.markForCheck();
    }

    clickShowLDAPSignin() {
        this.localSigninActive = false;
        this.localSignupActive = false;
        this.ldapSigninActive = true;
        this._cd.markForCheck();
    }

    signup(f: NgForm) {
        console.log(f.errors)
        /*if (this.passwordLevel < 3) {
            this.passwordShowError = true;
            this._cd.markForCheck();
            return;
        }*/

        this._authenticationService.localSignup(
            f.value.fullname,
            f.value.email,
            f.value.username,
            f.value.password,
            f.value.init_token
        ).subscribe(() => {
            this.showSuccessSignup = true;
            this._cd.markForCheck();
        });
    }

    signin(f: NgForm) {
        this._authenticationService.localSignin(f.value.username, f.value.password).subscribe(() => {
            if (this.redirect) {
                this._router.navigateByUrl(decodeURIComponent(this.redirect));
            } else {
                this._router.navigate(['home']);
            }
        });
    }

    ldapSignin(f: NgForm) {
        this._authenticationService.ldapSignin(f.value.bind, f.value.password, f.value.init_token).subscribe(() => {
            if (this.redirect) {
                this._router.navigateByUrl(decodeURIComponent(this.redirect));
            } else {
                this._router.navigate(['home']);
            }
        });
    }

    navigateToAskReset() {
        this._router.navigate(['/auth/ask-reset']);
    }
}
