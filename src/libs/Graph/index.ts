import * as d3 from 'd3';
import './style.css';

const margin = { top: 20, right: 30, bottom: 30, left: 40 };
const width = 960 - margin.left - margin.right;
const height = 250 - margin.top - margin.bottom;
const barPadding = 0.75;

interface WaterfallChartDataItem {
  name: (string | number);
  value: number;
}

interface WaterfallChartPreparedDataItem extends WaterfallChartDataItem {
  class: string;
  end: number;
  start: number;
}

interface WaterfallChartOptions {
  width: number;
  height: number;
  barPadding: number;
  margin: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}

export class WaterFallChart {
  private element: HTMLElement;
  private svg: any;
  private data: WaterfallChartDataItem[];
  private preparedData: WaterfallChartPreparedDataItem[];
  private options: WaterfallChartOptions = {
    barPadding: 0.75,
    height: 250,
    margin: {
      bottom: 30,
      left: 40,
      right: 30,
      top: 20,
    },
    width: 960,
  };
  private x: any;
  private y: any;
  private xAxis: any;
  private yAxis: any;

  constructor(element: HTMLElement, data: WaterfallChartDataItem[], options?: WaterfallChartOptions) {
    this.element = element;
    this.data = data;
    this.options = { ...this.options, ...options };

    this.x = d3.scaleBand().rangeRound([0, width]).padding(barPadding - .015); // v4
    // this.x = d3.scale.ordinal().rangeRoundBands([0, width], barPadding); // v3

    this.y = d3.scaleLinear().range([height, 0]); // v4
    // this.y = d3.scale.linear().range([height, 0]); // v3

    this.xAxis = d3.axisBottom().scale(this.x); // v4
    // this.xAxis = d3.svg.axis().scale(this.x).orient('bottom'); // v3

    this.yAxis = d3.axisLeft().scale(this.y).tickSize(-width).tickFormat(d => this.dollarFormatter(d)); // v4
    // this.yAxis = d3.svg.axis().scale(this.y).orient('left').tickFormat(d => this.dollarFormatter(d)); // v3
  }

  drawChart() {
    this.initChart();
    this.drawAxis();
    this.drawBars();
  }

  private dollarFormatter(n: number) {
    n = Math.round(n);

    if (Math.abs(n) > 1000) {
      return `$${Math.round(n / 1000)}K`;
    }

    return `$${n}`;
  }

  private getBarClassName(value, index) {
    if (index === 0) {
      return 'WaterfallChart__bar--base';
    }

    return (value >= 0) ? 'WaterfallChart__bar--positive' : 'WaterfallChart__bar--negative';
  }

  private prepareData(data: WaterfallChartDataItem[]) {
    const preparedData: WaterfallChartPreparedDataItem[] = [];

    // Transform data (i.e., finding cumulative values and total) for easier charting
    let cumulative = 0;
    for (let i = 0; i < data.length; i++) {
      const preparedDataItem: WaterfallChartPreparedDataItem = {
        ...data[i],
        class: this.getBarClassName(data[i].value, i),
        end: cumulative + data[i].value,
        start: cumulative,
      }

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

  private createSvg(element: HTMLElement) {
    return d3.select(element).append('svg')
      .attr('class', 'WaterfallChart')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
  }

  private initChart() {
    this.svg = this.createSvg(this.element);
    this.preparedData = this.prepareData(this.data);

    this.x.domain(this.preparedData.map((d: WaterfallChartPreparedDataItem) => d.name));
    this.y.domain([0, d3.max(this.preparedData, (d: WaterfallChartPreparedDataItem) => d.end)]);
  }

  private drawAxis() {
    this.svg.append('g')
      .attr('class', 'WaterfallChart__axis WaterfallChart__axis--x')
      .attr('transform', `translate(0, ${height})`)
      .call(this.xAxis);

    this.svg.append('g')
      .attr('class', 'WaterfallChart__axis WaterfallChart__axis--y')
      .call(this.yAxis)
      .select('.domain').remove();
  }

  private drawBars() {
    const bar = this.svg.selectAll('WaterfallChart__bar')
      .data(this.preparedData)
      .enter()
      .append('g')
      .attr('class', (d: WaterfallChartPreparedDataItem) => `WaterfallChart__bar ${d.class}`)
      .attr('transform', (d: WaterfallChartPreparedDataItem) => `translate(${this.x(d.name)}, 0)`);

    bar.append('rect')
      .attr('y', (d: WaterfallChartPreparedDataItem) => this.y(Math.max(d.start, d.end)))
      .attr('height', (d: WaterfallChartPreparedDataItem) => Math.abs(this.y(d.start) - this.y(d.end)))
      .attr('width', this.x.bandwidth()); // v4
    // .attr('width', this.x.rangeBand()); // v3

    bar.append('text')
      .attr('x', this.x.bandwidth() / 2) // v4
      // .attr('x', this.x.rangeBand() / 2) // v3
      .attr('y', (d: WaterfallChartPreparedDataItem) => this.y(d.end) + 5)
      .attr('dy', (d: WaterfallChartPreparedDataItem) => ((d.class === 'WaterfallChart__bar--negative') ? '' : '-') + '.75em')
      .text((d: WaterfallChartPreparedDataItem) => this.dollarFormatter(d.end - d.start));

    bar.filter((d: WaterfallChartPreparedDataItem) => d.class !== 'WaterfallChart__bar--total')
      .append('line')
      .attr('class', 'WaterfallChart__connector')
      .attr('x1', this.x.bandwidth() + 5) // v4
      // .attr('x1', this.x.rangeBand() + 5) // v3
      .attr('y1', (d: WaterfallChartPreparedDataItem) => this.y(d.end))
      .attr('x2', this.x.bandwidth() / (1 - barPadding) - 5) // v4
      // .attr('x2', this.x.rangeBand() / (1 - barPadding) - 5) // v3
      .attr('y2', (d: WaterfallChartPreparedDataItem) => this.y(d.end));
  }
}

export default WaterFallChart;
