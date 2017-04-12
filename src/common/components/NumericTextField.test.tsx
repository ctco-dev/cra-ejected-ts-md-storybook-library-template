import {normalizeInput} from './NumericTextField';

it('should provide a function to normalize text inputs', () => {
  expect(normalizeInput('123d')).toBe('123');
});
