import * as React from 'react';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import logo from './logo.svg';
import NumericTextField from './common/components/NumericTextField';
import WaterfallChart from './libs/Graph';

import './inject-tap-event-plugin';
import './App.css';

const mockData = [
  { name: 'Product Revenue', value: 420000 },
  { name: 'Services Revenue', value: 210000 },
  { name: 'Fixed Costs', value: -170000 },
  { name: 'Variable Costs', value: -140000 },
];

class App extends React.Component<any, any> {
  graphEl;
  interval;

  state = {
    secondsSinceReload: 0,
  };

  componentDidMount() {
    this.interval = setInterval(this.updateTimer, 1000);

    const graph = new WaterfallChart(this.graphEl, mockData);
    graph.drawChart();
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  render() {
    return (
      <MuiThemeProvider>
        <div className="App">
          {this.renderHeader()}
          {this.renderIntro()}
          {this.renderTimeSinceLastReload()}
          {this.renderMd()}
          {this.renderCloudMessage()}
          <div id="graph" ref={el => this.graphEl = el} />
        </div>
      </MuiThemeProvider>
    );
  }

  private renderHeader = () => (
    <div className="App-header">
      <img src={logo} className="App-logo" alt="logo" />
      <h2>Welcome to React</h2>
    </div>
  )

  private renderIntro = () => (
    <p className="App-intro">
      To get started, edit <code>src/App.tsx</code> and save to reload.
    </p>
  )

  private renderTimeSinceLastReload = () => (
    <p className="App-timer">
      <strong>{this.state.secondsSinceReload}</strong> seconds since last cold reload.
    </p>
  )

  private renderMd = () => (
    <NumericTextField id="showcase" floatingLabelText="Welcome to MaterialUI" />
  )

  private updateTimer = () => {
    this.setState(({ secondsSinceReload }) => ({ secondsSinceReload: ++secondsSinceReload }));
  }

  private renderCloudMessage = () => (
    <p className="App-greeting">
      {process.env.REACT_APP_GREETING
        ? <span className="App-greetingMsg">{process.env.REACT_APP_GREETING}</span>
        : (
          <span className="App-greetingStub">
            Please set <code>REACT_APP_GREETING</code> environment variable on your
            app server.
          </span>
        )
      }
    </p>
  )
}

export default App;
