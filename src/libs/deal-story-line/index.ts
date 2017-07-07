import * as d3 from 'd3';

import { dollarFormatter } from '../../helpers/numbers';
import { prepareData, DealStoryLinePreparedDataItem } from './_DealStoryLineData';
import { DealStoryLineOptions, DealStoryLineDataItem } from './types';

// Use require instead of import to include css to
// avoid from typescript trying to generate typings for it
require('./style.css'); // tslint:disable-line:no-var-requires

class DealStoryLine {
  private element: HTMLElement;
  private data: DealStoryLineDataItem[];
  private options: DealStoryLineOptions = {
    aspectRatio: (3 / 1),
    barPadding: 0.75,
    height: 960 / (3 / 1),
    layer: 0,
    margin: {
      bottom: 30,
      left: 40,
      right: 30,
      top: 20,
    },
    scale: 9.6,
    value: 'loss',
    width: 960,
  };
  private preparedData: DealStoryLinePreparedDataItem[];
  private svg: any;
  private x: any;
  private y: any;
  private xAxis: any;
  private yAxis: any;

  constructor(element: HTMLElement, data: DealStoryLineDataItem[] = [], options: Partial<DealStoryLineOptions> = {}) {
    this.element = element;
    this.data = data;
    this.options = { ...this.options, ...options };
    this.preparedData = prepareData(this.data, this.options.layer, this.options.value);

    this.setSize();
    this.initChart();

    this.svg = this.createSvg(this.element);
  }

  drawChart(): void {
    this.drawAxis();
    this.drawBars();
  }

  updateChart(data: DealStoryLineDataItem[] = this.data, options: Partial<DealStoryLineOptions> = this.options) {
    this.data = data;

    if (options && JSON.stringify(this.options) !== JSON.stringify(options)) {
      this.options = { ...this.options, ...options };
    }

    this.clearChart();
    this.preparedData = prepareData(this.data, this.options.layer, this.options.value);

    if (options && this.options.aspectRatio !== options.aspectRatio || options && this.options.scale !== options.scale) {
      this.setSize();
      this.svg = this.createSvg(this.element);
    }

    this.initChart();
    this.drawChart();
  }

  private createSvg(element: HTMLElement): HTMLElement {
    const { width, height, margin, aspectRatio } = this.options;

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

  private setSize() {
    this.options.width = this.calculateWidth(this.options.scale);
    this.options.height = this.calculateHeight(this.options.width, this.options.aspectRatio);
  }

  private clearChart(): void {
    this.preparedData = [];

    this.svg.selectAll('DealStoryLine__bar').remove();
    this.svg.selectAll('g').remove();
  }

  private initChart(): void {
    const { width, height, barPadding } = this.options;

    this.x = d3.scaleBand().rangeRound([0, width]).padding(barPadding - .015); // v4
    this.y = d3.scaleLinear().range([height, 0]); // v4

    this.xAxis = d3.axisBottom().scale(this.x); // v4
    this.yAxis = d3.axisLeft().scale(this.y).tickSize(-width).tickFormat(d => dollarFormatter(d)); // v4

    this.x.domain(this.preparedData.map((d: DealStoryLinePreparedDataItem) => d.displayName));
    this.y.domain([0, d3.max(this.preparedData, (d: DealStoryLinePreparedDataItem) => d.end)]);
  }

  private drawAxis(): void {
    const { height } = this.options;

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
    const { barPadding, layer, value } = this.options;

    const bar = this.svg.selectAll('DealStoryLine__bar')
      .data(this.preparedData)
      .enter()
      .append('g')
      .attr('opacity', 0)
      .attr('class', (d: DealStoryLinePreparedDataItem) => `DealStoryLine__bar ${d.class}`)
      .attr('transform', (d: DealStoryLinePreparedDataItem) => `translate(${this.x(d.displayName)}, 0)`);

    bar.append('rect')
      .attr('y', (d: DealStoryLinePreparedDataItem) => this.y(Math.max(d.start, d.end)))
      .attr('height', (d: DealStoryLinePreparedDataItem) => Math.abs(this.y(d.start) - this.y(d.end)))
      .attr('width', this.x.bandwidth()); // v4

    bar.append('text')
      .attr('x', this.x.bandwidth() / 2) // v4
      .attr('y', (d: DealStoryLinePreparedDataItem) => this.y(d.end) + 5)
      .attr('dy', (d: DealStoryLinePreparedDataItem) => ((d.class === 'DealStoryLine__bar--negative') ? '' : '-') + '.75em')
      .text((d: DealStoryLinePreparedDataItem) => dollarFormatter(d.layers[layer][value]));

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
