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

interface DealStoryLineOptions {
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
  layer: number;
  scale: number;
  value: string;
}

export class DealStoryLine {
  private element: HTMLElement;
  private data: DealStoryLineDataItem[];
  private layer: number;
  private value: string;
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

  constructor(element: HTMLElement, data: DealStoryLineDataItem[] = [], value: string = 'loss', layer: number = 0, options = {}) {
    this.element = element;
    this.data = data;
    this.value = value;
    this.layer = layer;
    this.options = { ...this.options, ...options };
    this.preparedData = this.prepareData(this.data);

    this.setSize();
    this.initChart();

    this.svg = this.createSvg(this.element);
  }

  drawChart(): void {
    this.drawAxis();
    this.drawBars();
  }

  updateChart(
    value: string = this.value,
    layer: number = this.layer,
    data: DealStoryLineDataItem[] = this.data,
    options: DealStoryLineOptions = this.options,
  ) {
    this.data = data;
    this.value = value;
    this.layer = layer;

    if (options && JSON.stringify(this.options) !== JSON.stringify(options)) {
      this.options = { ...this.options, ...options };
    }

    this.clearChart();
    this.preparedData = this.prepareData(this.data);

    if (options && this.options.aspectRatio !== options.aspectRatio || options && this.options.scale !== options.scale) {
      this.setSize();
      this.svg = this.createSvg(this.element);
    }

    this.initChart();
    this.drawChart();
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

  private prepareData(data: DealStoryLineDataItem[]) {
    const preparedData: DealStoryLinePreparedDataItem[] = [];

    let cumulative: number = 0;
    for (let i = 0; i < data.length; i++) {
      const itemValue = data[i].layers[this.layer][this.value];
      if (!itemValue) {
        continue;
      }

      const endValue: number = this.getEndValue(itemValue, cumulative);

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
    this.yAxis = d3.axisLeft().scale(this.y).tickSize(-width).tickFormat(d => this.dollarFormatter(d)); // v4

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
    const { barPadding } = this.options;

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
      .text((d: DealStoryLinePreparedDataItem) => this.dollarFormatter(d.layers[this.layer][this.value]));

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
