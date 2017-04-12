import * as React from 'react';
import './App.css';
import * as logo from './logo.svg';
import NumericTextField from './common/components/NumericTextField';

class App extends React.Component<any, any> {
  render() {
    return (
      <div className="App">
        <div className="App-header">
          <img src={logo as any} className="App-logo" alt="logo" />
          <h2>Welcome to React</h2>
        </div>
        <p className="App-intro">
          To get started, edit <code>src/App.tsx</code> and save to reload.
        </p>
        <NumericTextField id="showcase" floatingLabelText="Welcome to MaterialUI" onChange={() => {}} />
      </div>
    );
  }
}

export default App;
