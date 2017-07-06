import * as React from 'react';
import { default as DealStoryLineLib } from '../libs/DealStoryLine';

class DealStoryLine extends React.Component<any, any> {
  private graph: any;
  private graphEl: HTMLElement;
  private expectedParams = {
    initial: ['element', 'data', 'value', 'layer', 'options'],
    update: ['value', 'layer', 'data', 'options'],
  };

  componentDidMount(): void {
    this.renderDealStoryLine();
  }

  componentWillReceiveProps(nextProps): void {
    this.graph.updateChart(...this.getParams(nextProps, 'update'));
  }

  render(): JSX.Element {
    return (
      <div className="DealStoryLine" ref={(el => this.graphEl = (el as HTMLElement))} />
    );
  }

  private getParams(props, type = 'initial'): Array<(string | number | null | undefined)> {
    const params: Array<(string | number | null | undefined)> = [];

    for (const prop in props) {
      if (!Object.prototype.hasOwnProperty.call(props, prop)) { continue; }

      if (this.expectedParams[type].indexOf(prop) > -1) {
        params[this.expectedParams[type].indexOf(prop)] = props[prop];
      }
    }

    return params;
  }

  private renderDealStoryLine(): void {
    const params = this.getParams({ ...this.props, element: this.graphEl });

    this.graph = new (Function.prototype.bind.call(DealStoryLineLib))(...params);
    this.graph.drawChart();
  }
}

export default DealStoryLine;
