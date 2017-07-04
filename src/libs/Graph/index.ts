import * as d3 from 'd3';
import './style.css';

const margin = { top: 20, right: 30, bottom: 30, left: 40 };
const width = 960 - margin.left - margin.right;
const height = 500 - margin.top - margin.bottom;
const padding = 0.75;

export class WaterFallChart {
  private element: any;
  private svg: any;
  private data: any;
  private preparedData: any;
  private options: any;
  private x: any;
  private y: any;
  private xAxis: any;
  private yAxis: any;

  constructor(element, data, options = null) {
    this.element = element;
    this.data = data;
    this.options = options;

    this.x = d3.scaleBand().rangeRound([0, width]).padding(padding - .015); // v4
    // this.x = d3.scale.ordinal().rangeRoundBands([0, width], padding); // v3

    this.y = d3.scaleLinear().range([height, 0]); // v4
    // this.y = d3.scale.linear().range([height, 0]); // v3

    this.xAxis = d3.axisBottom().scale(this.x); // v4
    // this.xAxis = d3.svg.axis().scale(this.x).orient('bottom'); // v3

    this.yAxis = d3.axisLeft().scale(this.y).tickFormat(d => this.dollarFormatter(d)); // v4
    // this.yAxis = d3.svg.axis().scale(this.y).orient('left').tickFormat(d => this.dollarFormatter(d)); // v3
  }

  type(d) {
    d.value = +d.value;
    return d;
  }

  dollarFormatter(n) {
    n = Math.round(n);
    let result = n;

    if (Math.abs(n) > 1000) {
      result = Math.round(n / 1000) + 'K';
    }

    return '$' + result;
  }

  prepareData(data) {
    const preparedData: any = [];

    // Transform data (i.e., finding cumulative values and total) for easier charting
    let cumulative = 0;
    for (let i = 0; i < data.length; i++) {
      preparedData[i] = { ...data[i] };
      preparedData[i].start = cumulative;
      cumulative += data[i].value;
      preparedData[i].end = cumulative;
      preparedData[i].class = (preparedData[i].value >= 0) ? 'WaterfallChart__bar--positive' : 'WaterfallChart__bar--negative';
    }

    preparedData.push({
      class: 'WaterfallChart__bar--total',
      end: cumulative,
      name: 'Total',
      start: 0,
    });

    return preparedData;
  }

  createSvg(element) {
    return d3.select(element).append('svg')
      .attr('class', 'WaterfallChart')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
  }

  initChart() {
    this.svg = this.createSvg(this.element);
    this.preparedData = this.prepareData(this.data);

    this.x.domain(this.preparedData.map(d => d.name));
    this.y.domain([0, d3.max(this.preparedData, d => d.end)]);
  }

  drawAxis() {
    this.svg.append('g')
      .attr('class', 'WaterfallChart__axis WaterfallChart__axis--x')
      .attr('transform', `translate(0, ${height})`)
      .call(this.xAxis);

    this.svg.append('g')
      .attr('class', 'WaterfallChart__axis WaterfallChart__axis--y')
      .call(this.yAxis);
  }

  drawBars() {
    const bar = this.svg.selectAll('WaterfallChart__bar')
      .data(this.preparedData)
      .enter()
      .append('g')
        .attr('class', d => `WaterfallChart__bar ${d.class}`)
        .attr('transform', d => `translate(${this.x(d.name)}, 0)`);

    bar.append('rect')
      .attr('y', d => this.y(Math.max(d.start, d.end)))
      .attr('height', d => Math.abs(this.y(d.start) - this.y(d.end)))
      .attr('width', this.x.bandwidth()); // v4
      // .attr('width', this.x.rangeBand()); // v3

    bar.append('text')
      .attr('x', this.x.bandwidth() / 2) // v4
      // .attr('x', this.x.rangeBand() / 2) // v3
      .attr('y', d => this.y(d.end) + 5)
      .attr('dy', d => ((d.class === 'WaterfallChart__bar--negative') ? '' : '-') + '.75em')
      .text(d => this.dollarFormatter(d.end - d.start));

    bar.filter(d => d.class !== 'WaterfallChart__bar--total')
      .append('line')
        .attr('class', 'WaterfallChart__connector')
        .attr('x1', this.x.bandwidth() + 5) // v4
        // .attr('x1', this.x.rangeBand() + 5) // v3
        .attr('y1', d => this.y(d.end))
        .attr('x2', this.x.bandwidth() / (1 - padding) - 5) // v4
        // .attr('x2', this.x.rangeBand() / (1 - padding) - 5) // v3
        .attr('y2', d => this.y(d.end));
  }

  drawChart() {
    this.initChart();
    this.drawAxis();
    this.drawBars();
  }
}

export default WaterFallChart;
