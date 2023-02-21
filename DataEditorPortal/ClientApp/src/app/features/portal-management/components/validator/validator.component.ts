import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { FormlyConfig } from '@ngx-formly/core';

@Component({
  selector: 'app-validator',
  templateUrl: './validator.component.html',
  styleUrls: ['./validator.component.scss']
})
export class ValidatorComponent implements OnInit {
  validatorFormControl = new FormControl([], Validators.required);
  regexpFormControl = new FormControl('');
  visible = false;

  options: { label: string; value: string }[] = [];
  regexp: { regex: string; msg: string }[] = [];
  formControlOptions: { formControl: FormControl }[] = [];

  @Input() value!: any;
  @Output() sendValue = new EventEmitter<any>();

  constructor(private formlyConfig: FormlyConfig) {
    const validators = this.formlyConfig.validators;
    Object.keys(validators).forEach((key: string) => {
      this.options.push({ label: key, value: key });
    });
  }

  ngOnInit() {
    const selected: never[] = [];
    this.value.map((item: never) => {
      if (typeof item === 'string') {
        selected.push(item);
      } else {
        this.regexp.push(item);
      }
    });
    this.validatorFormControl.setValue(selected ?? []);
    this.regexpFormControl.setValue(this.regexp[0].regex);
  }

  showDialog() {
    this.visible = true;
  }

  onOk() {
    this.regexp[0].regex = this.regexpFormControl.value || '';
    const data = [];
    if (this.validatorFormControl.value) {
      data.push(...this.validatorFormControl.value, {
        regex: this.regexp[0].regex || '',
        msg: this.regexp[0].msg
      });
    }
    this.visible = false;
  }

  onSendData() {
    this.sendValue.emit(this.value);
  }

  onCancel() {
    this.visible = false;
  }
}
