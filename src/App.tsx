import React, {Component} from 'react';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import logo from './logo.svg';
import NumericTextField from './common/components/NumericTextField';

import './inject-tap-event-plugin';
import './App.css';

class App extends Component<any, any> {

  interval;

  state = {
    secondsSinceReload: 0,
  };

  componentDidMount() {
    this.interval = setInterval(this.updateTimer, 1000);
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  render() {
    return (
      <MuiThemeProvider>
        <div className="App">
          <div className="App-header">
            <img src={logo} className="App-logo" alt="logo"/>
            <h2>Welcome to React</h2>
          </div>
          <p className="App-intro">
            To get started, edit <code>src/App.tsx</code> and save to reload.
            {this.renderTimeSinceLastReload()}
          </p>
          {this.renderMd()}
        </div>
      </MuiThemeProvider>
    );
  }

  private renderMd = () => (
    <NumericTextField id="showcase" floatingLabelText="Welcome to MaterialUI"/>
  )

  private renderTimeSinceLastReload = () => (
    <div>
      {`${this.state.secondsSinceReload} seconds since last reload.`}
    </div>
  )

  private updateTimer = () => {
    this.setState(({secondsSinceReload}) => ({secondsSinceReload: ++secondsSinceReload}));
  }
}

export default App;
