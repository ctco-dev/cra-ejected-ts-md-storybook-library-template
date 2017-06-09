import React from 'react';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

const muiDecorator = (story) => (
  <MuiThemeProvider>
    {story()}
  </MuiThemeProvider>
);

export default muiDecorator;
