import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { NgFor, NgIf } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button'

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  imports: [
    RouterOutlet, 
    ReactiveFormsModule, 
    NgIf, 
    NgFor,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule
  ]
})
export class AppComponent implements OnInit {
    public title: string = 'currency-convertor';
    public resultText: string = 'Result appears here';
    public form: FormGroup = new FormGroup({
        amount: new FormControl(''),
        from: new FormControl(''),
        to: new FormControl(''),
        converted_amount: new FormControl('')
    });
    public currencyData: any = {};
    public currencyCodes = Object.keys(this.currencyData);

    constructor() {}

    ngOnInit() {
        this.form = new FormGroup({
            amount: new FormControl(null, Validators.required),
            from: new FormControl(null, Validators.required),
            to: new FormControl(null, Validators.required),
            converted_amount: new FormControl({value: 0, disabled: true})
        }, { validators: this.isSameCurrencyValidator});
        this.getSymbols();
    }

    public getSymbols() {
        let myHeaders: any = new Headers();
        myHeaders.append('apikey', 'hZqc0Gi4IrO3TFroyu46FDIe1Rh2CQgi');

        let requestOptions: any = {
            method: 'GET',
            redirect: 'follow',
            headers: myHeaders
        };

        fetch(
            'https://api.apilayer.com/exchangerates_data/latest?symbols=USD%2CEUR%2CRUB%2CPOUND%2CGBP&base=USD',
            requestOptions
        )
        .then((response) => {
            if (response.status >= 400) {
                throw new Error('Failed to fetch data');
            }
            return response.text();
        })
        .then((result) => {
            this.currencyData = JSON.parse(result).rates;
            this.currencyCodes = Object.keys(this.currencyData).sort();
            console.log(this.currencyData);
        })
        .catch((err) => console.log(err.message));
    }

    public convert(amount: number, from: string, to: string): number {
        let fromConversionCoefficient: number = this.currencyData[from];
        let toConversionCoefficient: number = this.currencyData[to];
        return (toConversionCoefficient / fromConversionCoefficient) * amount;
    }

    public onSubmit() {
        if (this.form.valid) {
            let amount: number = parseFloat(this.form.get('amount')?.value);
            let convertFrom: string = this.form.get('from')?.value;
            let convertTo: string = this.form.get('to')?.value;
            let result = this.convert(amount, convertFrom, convertTo);
            result = parseFloat(result.toFixed(2));
            this.resultText = `${amount} ${convertFrom} = ${result} ${convertTo}`;
        }
    }

    public convertAmount() {
        let amount: number = parseFloat(this.form.get('amount')?.value);
        let convertFrom: string = this.form.get('from')?.value;
        let convertTo: string = this.form.get('to')?.value;
        let result = this.convert(amount, convertFrom, convertTo);
        
        return parseFloat(result.toFixed(2));
    }

    public isSameCurrencyValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
        const from = control.get('from');
        const to = control.get('to');

        if (from?.value && to?.value && from.value === to.value) {
          to.setErrors({ 'areSame': true })
        }

        return null;
    }

    public onChange(event: any) {
        let amount: number = parseFloat(this.form.get('amount')?.value);
        let convertFrom: string = this.form.get('from')?.value;
        let convertTo: string = this.form.get('to')?.value;
        let result = this.convert(amount, convertFrom, convertTo);
        result = parseFloat(result.toFixed(2));

        if (convertFrom && convertTo) {
          this.form.get('converted_amount')?.setValue(result)
        }
    }

    public onCurrencyChange() {
      let amount: number = this.form.get('amount')?.value;
      if (amount) {
        this.form.get('amount')?.setValue(null);
        this.form.get('converted_amount')?.setValue(null);
        this.resultText = 'Result appears here';
      }
    }
}
