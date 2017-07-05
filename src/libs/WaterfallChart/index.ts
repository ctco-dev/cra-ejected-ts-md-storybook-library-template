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

interface WaterfallChartOptions {
  aspectRatio: number;
  width: number;
  height: number;
  barPadding: number;
  margin: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  scale: number;
}

export class WaterFallChart {
  private element: HTMLElement;
  private data: WaterfallChartDataItem[];
  private options: WaterfallChartOptions = {
    aspectRatio: (3 / 1),
    barPadding: 0.75,
    height: 960 / (3 / 1),
    margin: {
      bottom: 30,
      left: 40,
      right: 30,
      top: 20,
    },
    scale: 9.6,
    width: 960,
  };
  private preparedData: WaterfallChartPreparedDataItem[];
  private svg: any;
  private x: any;
  private y: any;
  private xAxis: any;
  private yAxis: any;

  constructor(element: HTMLElement, data: WaterfallChartDataItem[], options = {}) {
    this.element = element;
    this.data = data;
    this.options = { ...this.options, ...options };

    this.options.width = this.calculateWidth(this.options.scale);
    this.options.height = this.calculateHeight(this.options.width, this.options.aspectRatio);
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

      // For new data structure - in dev
      // const d = {
      //   ...data[i],
      //   class: this.getBarClassName((data[i].layers[this.props.layer] - cumulative), i),
      //   end: i === 0 ? cumulative + data[i].layers[this.props.layer] : cumulative + (data[i].layers[this.props.layer] - cumulative),
      //   start: cumulative,
      // };

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

  private createSvg(element: HTMLElement) {
    const { width, height, margin, aspectRatio } = this.options;

    d3.select(element).select('div.WaterfallChart').remove();

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

  private calculateWidth(scale) {
    return scale * 100;
  }

  private calculateHeight(width, aspectRatio) {
    return width / aspectRatio;
  }

  private initChart() {
    const { width, height, barPadding } = this.options;

    this.svg = this.createSvg(this.element);
    this.preparedData = this.prepareData(this.data);

    this.x = d3.scaleBand().rangeRound([0, width]).padding(barPadding - .015); // v4
    this.y = d3.scaleLinear().range([height, 0]); // v4

    this.xAxis = d3.axisBottom().scale(this.x); // v4
    this.yAxis = d3.axisLeft().scale(this.y).tickSize(-width).tickFormat(d => this.dollarFormatter(d)); // v4

    this.x.domain(this.preparedData.map((d: WaterfallChartPreparedDataItem) => d.name));
    this.y.domain([0, d3.max(this.preparedData, (d: WaterfallChartPreparedDataItem) => d.end)]);
  }

  private drawAxis() {
    const { height } = this.options;

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
    const { barPadding } = this.options;

    const bar = this.svg.selectAll('WaterfallChart__bar')
      .data(this.preparedData)
      .enter()
      .append('g')
      .attr('opacity', 0)
      .attr('class', (d: WaterfallChartPreparedDataItem) => `WaterfallChart__bar ${d.class}`)
      .attr('transform', (d: WaterfallChartPreparedDataItem) => `translate(${this.x(d.name)}, 0)`);

    bar.append('rect')
      .attr('y', (d: WaterfallChartPreparedDataItem) => this.y(Math.max(d.start, d.end)))
      .attr('height', (d: WaterfallChartPreparedDataItem) => Math.abs(this.y(d.start) - this.y(d.end)))
      .attr('width', this.x.bandwidth()); // v4

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

export default WaterFallChart;
