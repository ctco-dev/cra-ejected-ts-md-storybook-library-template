import { DealStoryLineDataItem } from './types';

export interface DealStoryLinePreparedDataItem extends DealStoryLineDataItem {
    class: string;
    end: number;
    start: number;
}

const getBarClassName = (value: number, cumulative: number): string => {
    if (cumulative === 0) {
        return 'DealStoryLine__bar--base';
    }

    return (value >= cumulative) ? 'DealStoryLine__bar--positive' : 'DealStoryLine__bar--negative';
};

const getStartValue = (cumulative: number, endValue: number): number => {
    return endValue === cumulative ? cumulative * 0.99 : cumulative;
};

const getEndValue = (itemValue: number, cumulative: number): number => {
    return cumulative === 0 ? itemValue : cumulative - (cumulative - itemValue);
};

export const prepareData = (data: DealStoryLineDataItem[], layer: number = 0, value: string = 'loss'): DealStoryLinePreparedDataItem[] => {
    const preparedData: DealStoryLinePreparedDataItem[] = [];

    let cumulative: number = 0;
    data.forEach(dataItem => {
        const itemValue = dataItem.layers[layer][value];
        if (!itemValue) {
            return;
        }

        const endValue: number = getEndValue(itemValue, cumulative);

        const preparedDataItem: DealStoryLinePreparedDataItem = {
            ...dataItem,
            class: getBarClassName(endValue, cumulative),
            end: endValue,
            start: getStartValue(cumulative, endValue),
        };

        preparedData.push(preparedDataItem);
        cumulative = endValue;
    });

    // Override classname and start value for the last bar
    preparedData[preparedData.length - 1].class = 'DealStoryLine__bar--total';
    preparedData[preparedData.length - 1].start = 0;

    return preparedData;
};
