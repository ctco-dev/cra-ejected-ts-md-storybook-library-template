import * as React from 'react';
import * as d3 from 'd3';

import './style.css';

interface DealStoryLineLayer {
  attachment?: number;
  cover?: number;
  frequency?: number;
  loss?: number;
}

interface DealStoryLineDataItem {
  currency: string;
  displayName: string;
  layers: DealStoryLineLayer[];
  ratingId: number;
}

interface DealStoryLinePreparedDataItem extends DealStoryLineDataItem {
  class: string;
  end: number;
  start: number;
}

interface DealStoryLineProps {
  data: DealStoryLineDataItem[];
  aspectRatio: number;
  barPadding: number;
  layer: number;
  margin: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  scale: number;
  value: string;
}

interface DealStoryLineState {
  preparedData: DealStoryLinePreparedDataItem[];
  width: number;
  height: number;
}

class DealStoryLine extends React.Component<any, DealStoryLineState> {
  public static defaultProps: DealStoryLineProps = {
    aspectRatio: (3 / 1),
    barPadding: 0.75,
    data: [],
    layer: 0,
    margin: {
      bottom: 30,
      left: 40,
      right: 30,
      top: 20,
    },
    scale: 9.6,
    value: 'loss',
  };

  public state: DealStoryLineState = this.getUpdatedState(this.props);

  private graphEl: HTMLElement;
  private svg: any;
  private x: any;
  private y: any;
  private xAxis: any;
  private yAxis: any;

  componentDidMount(): void {
    this.svg = this.createSvg(this.graphEl);

    this.initChart();
    this.drawChart();
  }

  componentDidUpdate(nextProps: DealStoryLineProps, prevState: DealStoryLineState): void {
    if (JSON.stringify(this.state.preparedData) !== JSON.stringify(prevState.preparedData)) {
      if (prevState.preparedData.length > 0) {
        this.clearChart();
      }

      if (this.props.aspectRatio !== nextProps.aspectRatio || this.props.scale !== nextProps.scale) {
        this.svg = this.createSvg(this.graphEl);
      }

      this.initChart();
      this.drawChart();
    }
  }

  componentWillReceiveProps(nextProps: DealStoryLineProps): void {
    if (JSON.stringify(nextProps) !== JSON.stringify(this.props)) {
      this.setState(this.getUpdatedState(nextProps));
    }
  }

  render(): JSX.Element {
    return (
      <div className="DealStoryLine" ref={(el => this.graphEl = (el as HTMLElement))} />
    );
  }

  private drawChart(): void {
    this.drawAxis();
    this.drawBars();
  }

  private dollarFormatter(n: number): string {
    n = Math.round(n);

    if (Math.abs(n) > 1000) {
      return `$${Math.round(n / 1000)}K`;
    }

    return `$${n}`;
  }

  private getBarClassName(value: number, index: number, cumulative: number, total: number): string {
    if (cumulative === 0) {
      return 'DealStoryLine__bar--base';
    }

    if (index === total - 1) {
      return 'DealStoryLine__bar--total';
    }

    return (value >= 0) ? 'DealStoryLine__bar--positive' : 'DealStoryLine__bar--negative';
  }

  private getStartValue(cumulative: number, endValue: number, index: number, total: number): number {
    if (index === total - 1) {
      return 0;
    }

    return endValue === cumulative ? cumulative * 0.99 : cumulative;
  }

  private getEndValue(itemValue: number, cumulative: number): number {
    return cumulative === 0 ? itemValue : cumulative - (cumulative - itemValue);
  }

  private getUpdatedState(props: DealStoryLineProps): DealStoryLineState {
    const updatedState: DealStoryLineState = {
      height: this.calculateHeight(this.calculateWidth(props.scale), props.aspectRatio),
      preparedData: this.prepareData(props.data),
      width: this.calculateWidth(props.scale),
    };

    return updatedState;
  }

  private prepareData(data: DealStoryLineDataItem[]): DealStoryLinePreparedDataItem[] {
    const { layer, value } = this.props;
    const preparedData: DealStoryLinePreparedDataItem[] = [];

    let cumulative: number = 0;
    for (let i = 0; i < data.length; i++) {
      const itemValue = data[i].layers[layer][value];
      if (!itemValue) {
        continue;
      }

      const endValue: number = this.getEndValue(itemValue, cumulative);

      // For new data structure - in dev
      const preparedDataItem: DealStoryLinePreparedDataItem = {
        ...data[i],
        class: this.getBarClassName(endValue, i, cumulative, data.length),
        end: endValue, 
        start: this.getStartValue(cumulative, endValue, i, data.length),
      };

      preparedData.push(preparedDataItem);
      cumulative = endValue;
    }

    return preparedData;
  }

  private createSvg(element: HTMLElement): HTMLElement {
    const { width, height } = this.state;
    const { margin, aspectRatio } = this.props;

    if (this.svg) {
      d3.select(element).select('div.DealStoryLine__container').remove();
    }

    return d3.select(element)
      .append('div')
      .attr('class', 'DealStoryLine__container')
      .attr('style', `padding-bottom: ${(100 / (aspectRatio)) + 2}%`)
      .append('svg')
      .attr('class', 'DealStoryLine__svg')
      .attr('preserveAspectRatio', 'xMinYMin meet')
      .attr('viewBox', `0 0 ${width + margin.left + margin.right} ${height + margin.bottom + margin.top}`)
      .append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
  }

  private calculateWidth(scale: number): number {
    return scale * 100;
  }

  private calculateHeight(width: number, aspectRatio: number): number {
    return width / aspectRatio;
  }

  private clearChart(): void {
    this.svg.selectAll('DealStoryLine__bar').remove();
    this.svg.selectAll('g').remove();
  }

  private initChart(): void {
    const { width, height } = this.state;
    const { barPadding } = this.props;

    this.x = d3.scaleBand().rangeRound([0, width]).padding(barPadding - .015); // v4
    this.y = d3.scaleLinear().range([height, 0]); // v4

    this.xAxis = d3.axisBottom().scale(this.x); // v4
    this.yAxis = d3.axisLeft().scale(this.y).tickSize(-width).tickFormat((d: number) => this.dollarFormatter(d)); // v4

    this.x.domain(this.state.preparedData.map((d: DealStoryLinePreparedDataItem) => d.displayName));
    this.y.domain([0, d3.max(this.state.preparedData, (d: DealStoryLinePreparedDataItem) => d.end)]);
  }

  private drawAxis(): void {
    const { height } = this.state;

    this.svg.append('g')
      .attr('class', 'DealStoryLine__axis DealStoryLine__axis--x')
      .attr('transform', `translate(0, ${height})`)
      .call(this.xAxis);

    this.svg.append('g')
      .attr('class', 'DealStoryLine__axis DealStoryLine__axis--y')
      .call(this.yAxis)
      .select('.domain').remove();
  }

  private drawBars(): void {
    const { barPadding } = this.props;

    const bar = this.svg.selectAll('DealStoryLine__bar')
      .data(this.state.preparedData)
      .enter()
      .append('g')
      .attr('opacity', 0)
      .attr('class', (d: DealStoryLinePreparedDataItem) => `DealStoryLine__bar ${d.class}`)
      .attr('transform', (d: DealStoryLinePreparedDataItem) => `translate(${this.x(d.displayName)}, 0)`);

    bar.append('rect')
      .attr('y', (d: DealStoryLinePreparedDataItem) => this.y(Math.max(d.start, d.end)))
      .attr('height', (d: DealStoryLinePreparedDataItem) => Math.abs(this.y(d.start) - this.y(d.end)))
      .attr('width', this.x.bandwidth());

    bar.append('text')
      .attr('x', this.x.bandwidth() / 2) // v4
      .attr('y', (d: DealStoryLinePreparedDataItem) => this.y(d.end) + 5)
      .attr('dy', (d: DealStoryLinePreparedDataItem) => ((d.class === 'DealStoryLine__bar--negative') ? '' : '-') + '.75em')
      .text((d: DealStoryLinePreparedDataItem) => this.dollarFormatter(d.end - d.start));

    bar.filter((d: DealStoryLinePreparedDataItem) => d.class !== 'DealStoryLine__bar--total')
      .append('line')
      .attr('class', 'DealStoryLine__connector')
      .attr('x1', this.x.bandwidth() + 5) // v4
      .attr('y1', (d: DealStoryLinePreparedDataItem) => this.y(d.end))
      .attr('x2', this.x.bandwidth() / (1 - barPadding) - barPadding * 24) // v4
      .attr('y2', (d: DealStoryLinePreparedDataItem) => this.y(d.end));

    bar.transition()
      .duration(400)
      .ease(d3.easeLinear)
      .attr('opacity', 1);
  }
}

export default DealStoryLine;
