import * as React from 'react';
import {storiesOf, action} from '@kadira/storybook';
import NumericTextField from './NumericTextField';

storiesOf('NumericTextField', module)
  .add('NumericTextField empty', () => (
    <NumericTextField id="test" onChange={action('changed')}/>
  ))
  .add('NumericTextField filled in', () => (
    <NumericTextField id="test" onChange={action('changed')} value="123456789"/>
  ));
