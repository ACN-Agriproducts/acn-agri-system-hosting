import { UsStateAbbreviationPipe } from './us-state-abbreviation.pipe';

describe('UsStateAbbreviationPipe', () => {
  it('create an instance', () => {
    const pipe = new UsStateAbbreviationPipe();
    expect(pipe).toBeTruthy();
  });
});
