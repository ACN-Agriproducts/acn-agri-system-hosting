import { DatePipe } from '@angular/common';
import { FlatPricePipe, MaskValuePipe, MaskZerosPipe } from '../printable-pipes/printable-pipes.pipe';

describe('FlatPricePipe', () => {
  it('create an instance', () => {
    const pipe = new FlatPricePipe(new DatePipe("en-US"));
    expect(pipe).toBeTruthy();
  });
});

describe('MaskZerosPipe', () => {
  it('create an instance', () => {
    const pipe = new MaskZerosPipe();
    expect(pipe).toBeTruthy();
  });
});

describe('MaskValuePipe', () => {
  it('create an instance', () => {
    const pipe = new MaskValuePipe();
    expect(pipe).toBeTruthy();
  });
});
