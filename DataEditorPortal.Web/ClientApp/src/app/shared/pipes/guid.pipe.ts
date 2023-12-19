import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'guid'
})
export class GuidPipe implements PipeTransform {
  transform(value: string | null, outputFormat: 's' | 'n' | 'h' = 's'): string | null {
    if (!value) return value;

    // Check if the input is a little-endian hex string
    const isLittleEndianHexString = /^[0-9A-F]{32}$/i.test(value);

    // Remove braces and hyphens
    const cleanedValue = value.replace(/[{}-]/g, '');

    // If it is little-endian, reverse the byte order of the first 16 characters
    const guid = isLittleEndianHexString ? this.reverseBytes(cleanedValue) : cleanedValue;

    switch (outputFormat) {
      case 's':
        return this.formatStandard(guid);
      case 'n':
        return this.formatStandardNoBraces(guid);
      case 'h':
        return this.formatHex(guid, isLittleEndianHexString);
      default:
        return value; // Return the original value if the format is not recognized
    }
  }

  private formatStandard(guid: string): string {
    return `{${guid.substring(0, 8)}-${guid.substring(8, 12)}-${guid.substring(12, 16)}-${guid.substring(
      16,
      20
    )}-${guid.substring(20)}}`;
  }

  private formatStandardNoBraces(guid: string): string {
    return `${guid.substring(0, 8)}-${guid.substring(8, 12)}-${guid.substring(12, 16)}-${guid.substring(
      16,
      20
    )}-${guid.substring(20)}`;
  }

  private formatHex(guid: string, isLittleEndian: boolean): string {
    // If it is little-endian, reverse the byte order of the first 16 characters
    const formattedGuid = !isLittleEndian ? this.reverseBytes(guid.substring(0, 16)) + guid.substring(16) : guid;

    return formattedGuid.toUpperCase();
  }

  private reverseBytes(hex: string): string {
    // Reverse the first 8 characters, then 4 characters, then 4 characters
    const reversedSections = [
      hex.substring(0, 8).match(/.{2}/g)?.reverse().join('') || '',
      hex.substring(8, 12).match(/.{2}/g)?.reverse().join('') || '',
      hex.substring(12, 16).match(/.{2}/g)?.reverse().join('') || ''
    ];

    // Concatenate with the remaining characters
    return reversedSections.join('') + hex.substring(16);
  }
}
