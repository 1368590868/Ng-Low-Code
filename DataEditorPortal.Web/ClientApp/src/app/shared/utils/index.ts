import * as numeral from 'numeral';

export function evalStringExpression(expression: string, argNames: string[]) {
  try {
    return Function(...argNames, `return ${expression};`) as any;
  } catch (error) {
    console.error(error);
  }
}

export function evalExpression(
  // eslint-disable-next-line @typescript-eslint/ban-types
  expression: string | Function | boolean,
  thisArg: any,
  argVal: any[]
): any {
  if (typeof expression === 'function') {
    return expression.apply(thisArg, argVal);
  } else {
    return expression ? true : false;
  }
}

export function registerNumeral() {
  numeral.register('format', 'special', {
    regexps: {
      format: /^0+\+[0[\]().]+$/,
      unformat: /^0+\+[0[\]().]+$/
    },
    format: function (value, format, roundingFunction) {
      let output = '';
      const result = /^(0+)\+([0[\]().]+)+$/.exec(format);
      if (result && result.length >= 3) {
        const precision = 10 ** result[1].length;
        const fractionFormat = result[2];
        const integerNum = Math.floor(value / precision);
        const fractionNum = value - integerNum * precision;

        output = `${integerNum}+${numeral._.numberToFormat(
          fractionNum,
          fractionFormat,
          roundingFunction
        )}`;
      }

      return output;
    },
    unformat: function (string) {
      return numeral._.stringToNumber(string);
    }
  });
}

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import Quill from 'quill';
import QuillToggleFullscreenButton from 'quill-toggle-fullscreen-button';
import BlotFormatter from 'quill-blot-formatter';

export function registerQuill() {
  Quill.register('modules/blotFormatter', BlotFormatter);
  Quill.register('modules/toggleFullscreen', QuillToggleFullscreenButton);
}
