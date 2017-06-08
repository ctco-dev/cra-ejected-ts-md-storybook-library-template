import React from 'react';
import {storiesOf} from '@storybook/react';
import {action} from '@storybook/addon-actions';
import NumericTextField from './NumericTextField';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

storiesOf('NumericTextField', module)
  .addDecorator((story) => (
    <MuiThemeProvider>
      {story()}
    </MuiThemeProvider>
  ))
  .add('NumericTextField empty', () => (
    <NumericTextField id="test" onChange={action('changed')}/>
  ))
  .add('NumericTextField filled in', () => (
    <NumericTextField id="test" onChange={action('changed')} value="123456789"/>
  ));
