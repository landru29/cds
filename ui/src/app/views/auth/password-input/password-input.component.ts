import { ChangeDetectionStrategy, ChangeDetectorRef, Component, forwardRef, Input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import * as zxcvbn from 'zxcvbn';

@Component({
    selector: 'app-password-input',
    templateUrl: './password-input.html',
    styleUrls: ['./password-input.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => PasswordInputComponent),
            multi: true
        }
    ]
})
export class PasswordInputComponent implements ControlValueAccessor {
    @Input() name: string;

    @Input() set value(value: string) {
        this.passwordValue = value;
        this.onChange(value);
        this.onTouched();
    }
    get value() { return this.passwordValue; }

    isDisabled: boolean;
    passwordValue: string;
    passwordShowError: boolean;
    passwordLevel: number;

    onChange: (v: any) => {}
    onTouched: () => {}

    constructor(
        private _cd: ChangeDetectorRef
    ) { }

    writeValue(obj: any): void {
        this.passwordValue = obj;
    }

    registerOnChange(fn: any): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: any): void {
        this.onTouched = fn;
    }

    setDisabledState?(isDisabled: boolean): void {
        this.isDisabled = isDisabled;
    }

    onChangeSignupPassword(e: any) {
        this.passwordShowError = false;
        this.passwordValue = e.target.value;
        this.onChange(this.passwordValue);
        let res = zxcvbn(this.passwordValue);
        this.passwordLevel = res.score;
        this._cd.markForCheck();
    }
}
