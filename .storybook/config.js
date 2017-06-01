import {configure, addDecorator} from '@storybook/react';
import React from 'react';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

const req = require.context('../src/', true, /.stories.tsx$/);

const loadStories = () => {
  req.keys().forEach((filename) => req(filename))
};

addDecorator((story) => (
  <MuiThemeProvider>
    {story()}
  </MuiThemeProvider>
));
configure(loadStories, module);
