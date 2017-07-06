import * as React from 'react';
import * as d3 from 'd3';

import './style.css';

interface WaterfallChartDataItem {
  name: (string | number);
  value: number;
}

interface WaterfallChartPreparedDataItem extends WaterfallChartDataItem {
  class: string;
  end: number;
  start: number;
}

interface WaterfallChartProps {
  data: WaterfallChartDataItem[];
  aspectRatio: number;
  barPadding: number;
  margin: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  scale: number;
}

interface WaterfallChartState {
  preparedData: WaterfallChartPreparedDataItem[];
  width: number;
  height: number;
}

class WaterfallChart extends React.Component<any, WaterfallChartState> {
  public static defaultProps: WaterfallChartProps = {
    aspectRatio: (3 / 1),
    barPadding: 0.75,
    data: [],
    margin: {
      bottom: 30,
      left: 40,
      right: 30,
      top: 20,
    },
    scale: 9.6,
  };

  public state: WaterfallChartState = this.getUpdatedState(this.props);

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

  componentDidUpdate(nextProps: WaterfallChartProps, prevState: WaterfallChartState): void {
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

  componentWillReceiveProps(nextProps: WaterfallChartProps): void {
    if (JSON.stringify(nextProps) !== JSON.stringify(this.props)) {
      this.setState(this.getUpdatedState(nextProps));
    }
  }

  render(): JSX.Element {
    return (
      <div ref={(el => this.graphEl = (el as HTMLElement))} />
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

  private getBarClassName(value: number, index: number): string {
    if (index === 0) {
      return 'WaterfallChart__bar--base';
    }

    return (value >= 0) ? 'WaterfallChart__bar--positive' : 'WaterfallChart__bar--negative';
  }

  private getUpdatedState(props: WaterfallChartProps): WaterfallChartState {
    const updatedState: WaterfallChartState = {
      height: this.calculateHeight(this.calculateWidth(props.scale), props.aspectRatio),
      preparedData: this.prepareData(props.data),
      width: this.calculateWidth(props.scale),
    };

    return updatedState;
  }

  private prepareData(data: WaterfallChartDataItem[]): WaterfallChartPreparedDataItem[] {
    const preparedData: WaterfallChartPreparedDataItem[] = [];

    // Transform data (i.e., finding cumulative values and total) for easier charting
    let cumulative = 0;
    for (let i = 0; i < data.length; i++) {
      const preparedDataItem: WaterfallChartPreparedDataItem = {
        ...data[i],
        class: this.getBarClassName(data[i].value, i),
        end: cumulative + data[i].value,
        start: cumulative,
      };

      cumulative += data[i].value;
      preparedData.push(preparedDataItem);
    }

    preparedData.push({
      class: 'WaterfallChart__bar--total',
      end: cumulative,
      name: 'Renewed Rating',
      start: 0,
      value: 0,
    });

    return preparedData;
  }

  private createSvg(element: HTMLElement): HTMLElement {
    const { width, height } = this.state;
    const { margin, aspectRatio } = this.props;

    if (this.svg) {
      d3.select(element).select('div.WaterfallChart').remove();
    }

    return d3.select(element)
      .append('div')
      .attr('class', 'WaterfallChart')
      .attr('style', `padding-bottom: ${(100 / (aspectRatio)) + 2}%`)
      .append('svg')
      .attr('class', 'WaterfallChart__svg')
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
    this.svg.selectAll('WaterfallChart__bar').remove();
    this.svg.selectAll('g').remove();
  }

  private initChart(): void {
    const { width, height } = this.state;
    const { barPadding } = this.props;

    this.x = d3.scaleBand().rangeRound([0, width]).padding(barPadding - .015); // v4
    this.y = d3.scaleLinear().range([height, 0]); // v4

    this.xAxis = d3.axisBottom().scale(this.x); // v4
    this.yAxis = d3.axisLeft().scale(this.y).tickSize(-width).tickFormat((d: number) => this.dollarFormatter(d)); // v4

    this.x.domain(this.state.preparedData.map((d: WaterfallChartPreparedDataItem) => d.name));
    this.y.domain([0, d3.max(this.state.preparedData, (d: WaterfallChartPreparedDataItem) => d.end)]);
  }

  private drawAxis(): void {
    const { height } = this.state;

    this.svg.append('g')
      .attr('class', 'WaterfallChart__axis WaterfallChart__axis--x')
      .attr('transform', `translate(0, ${height})`)
      .call(this.xAxis);

    this.svg.append('g')
      .attr('class', 'WaterfallChart__axis WaterfallChart__axis--y')
      .call(this.yAxis)
      .select('.domain').remove();
  }

  private drawBars(): void {
    const { barPadding } = this.props;

    const bar = this.svg.selectAll('WaterfallChart__bar')
      .data(this.state.preparedData)
      .enter()
      .append('g')
      .attr('opacity', 0)
      .attr('class', (d: WaterfallChartPreparedDataItem) => `WaterfallChart__bar ${d.class}`)
      .attr('transform', (d: WaterfallChartPreparedDataItem) => `translate(${this.x(d.name)}, 0)`);

    bar.append('rect')
      .attr('y', (d: WaterfallChartPreparedDataItem) => this.y(Math.max(d.start, d.end)))
      .attr('height', (d: WaterfallChartPreparedDataItem) => Math.abs(this.y(d.start) - this.y(d.end)))
      .attr('width', this.x.bandwidth());

    bar.append('text')
      .attr('x', this.x.bandwidth() / 2) // v4
      .attr('y', (d: WaterfallChartPreparedDataItem) => this.y(d.end) + 5)
      .attr('dy', (d: WaterfallChartPreparedDataItem) => ((d.class === 'WaterfallChart__bar--negative') ? '' : '-') + '.75em')
      .text((d: WaterfallChartPreparedDataItem) => this.dollarFormatter(d.end - d.start));

    bar.filter((d: WaterfallChartPreparedDataItem) => d.class !== 'WaterfallChart__bar--total')
      .append('line')
      .attr('class', 'WaterfallChart__connector')
      .attr('x1', this.x.bandwidth() + 5) // v4
      .attr('y1', (d: WaterfallChartPreparedDataItem) => this.y(d.end))
      .attr('x2', this.x.bandwidth() / (1 - barPadding) - 5) // v4
      .attr('y2', (d: WaterfallChartPreparedDataItem) => this.y(d.end));
    
    bar.transition()
      .duration(400)
      .ease(d3.easeLinear)
      .attr('opacity', 1);
  }
}

export default WaterfallChart;
