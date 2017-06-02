import * as React from 'react';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import * as injectTapEventPlugin from 'react-tap-event-plugin';
import * as logo from './logo.svg';
import NumericTextField from './common/components/NumericTextField';

import './inject-tap-event-plugin';
import './App.css';

class App extends React.Component<any, any> {
  render() {
    return (
      <MuiThemeProvider>
        <div className="App">
          <div className="App-header">
            <img src={logo as any} className="App-logo" alt="logo"/>
            <h2>Welcome to React</h2>
          </div>
          <p className="App-intro">
            To get started, edit <code>src/App.tsx</code> and save to reload.
          </p>
          <NumericTextField id="showcase" floatingLabelText="Welcome to MaterialUI"/>
        </div>
      </MuiThemeProvider>
    );
  }
}

export default App;
