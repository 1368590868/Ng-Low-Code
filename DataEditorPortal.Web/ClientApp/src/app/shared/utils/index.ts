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
      format: /^\S+(\.\d{1,5})?\s\{[\s\S]\}$/,
      unformat: /^\S+(\.\d{1,5})?\s\{[\s\S]\}$/
    },
    format: function (value, format, roundingFunction) {
      let output;

      output = value;
      const newFormat = format.split(' ')[0];
      const operator = format.split(' ')[1][1];
      const left = format.split('.')[0].match(/0/g)?.join('') ?? '';
      // Splice divisor
      const precision = Number('1' + left);

      const integerNum = Math.floor(value / precision);
      const fractionaNum = value - integerNum * precision;
      output = `${integerNum}${operator}${numeral._.numberToFormat(
        fractionaNum,
        newFormat,
        roundingFunction
      )}`;

      return output;
    },
    unformat: function (string) {
      return numeral._.stringToNumber(string);
    }
  });
}
