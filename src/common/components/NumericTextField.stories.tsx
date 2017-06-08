import React from 'react';
import {storiesOf} from '@storybook/react';
import NumericTextField from './NumericTextField';

storiesOf('NumericTextField', module)
  .add('NumericTextField empty', () => (
    <NumericTextField id="test"/>
  ))
  .add('NumericTextField filled in', () => (
    <NumericTextField id="test" value="123456789"/>
  ));
