import React from 'react';
import {storiesOf} from '@storybook/react';
import {action} from '@storybook/addon-actions';
import NumericTextField from './NumericTextField';

storiesOf('NumericTextField', module)
  .add('NumericTextField empty', () => (
    <NumericTextField id="test" onChange={action('changed')}/>
  ))
  .add('NumericTextField filled in', () => (
    <NumericTextField id="test" onChange={action('changed')} value="123456789"/>
  ));
