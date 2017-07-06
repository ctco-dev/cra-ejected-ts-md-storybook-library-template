import * as React from 'react';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

// import DealStoryLine from './libs/DealStoryLine';
import DealStoryLine from './DealStoryLine';

import './inject-tap-event-plugin';
import './App.css';

// API Data
const apiData = [
  {
    currency: 'EUR',
    displayName: 'Original Rating',
    layers: [
      {
        attachment: 1000000,
        cover: 1000000,
      },
    ],
    ratingId: 1549308,
  },
  {
    currency: 'EUR',
    displayName: 'Calculation Version',
    layers: [
      {
        attachment: 1000000,
        cover: 1000000,
        frequency: 1,
        loss: 508675.7711509539,
      },
    ],
    ratingId: 1549316,
  },
  {
    currency: 'EUR',
    displayName: 'Parameter Set',
    layers: [
      {
        attachment: 1000000,
        cover: 1000000,
        frequency: 1,
        loss: 508675.7711509539,
      },
    ],
    ratingId: 1549317,
  },
  {
    currency: 'EUR',
    displayName: 'Inception Date',
    layers: [
      {
        attachment: 1000000,
        cover: 1000000,
        frequency: 1,
        loss: 518822.5825016733,
      },
    ],
    ratingId: 1549318,
  },
  {
    currency: 'EUR',
    displayName: 'Renewed Rating',
    layers: [
      {
        attachment: 1000000,
        cover: 1000000,
        frequency: 1,
        loss: 518822.5825016733,
      },
      {
        attachment: 2000000,
        cover: 1000000,
        frequency: 0.15979530183875734,
        loss: 117565.21384617564,
      },
    ],
    ratingId: 1549315,
  },
];

class App extends React.Component<any, any> {
  graphEl;
  graphLib;

  state = {
    data: apiData,
  };

  componentDidMount() {
    // Library
    // this.renderDealStoryLine();

    // setInterval(() => {
    //   this.setState({
    //     data: JSON.stringify(this.state.data) === JSON.stringify(mockData) ? mockData2 : mockData,
    //   });
    // }, 3000);
  }

  // Library
  // componentDidUpdate() {
  //   this.renderDealStoryLine();
  // }

  // Library
  // renderDealStoryLine() {
  //   this.graphLib = new DealStoryLine(this.graphEl, this.state.data);
  //   this.graphLib.drawChart();
  // }

  render() {
    return (
      <MuiThemeProvider>
        <div className="App">
          {/* Library */}
          {/*<div id="graph-lib" ref={el => this.graphEl = el} />*/}

          {/*React component */}
          <div id="graph-react">
            <DealStoryLine {...this.state} />
          </div>
        </div>
      </MuiThemeProvider>
    );
  }
}

export default App;
