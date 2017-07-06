export interface DealStoryLineLayer {
    attachment?: number;
    cover?: number;
    frequency?: number;
    loss?: number;
}

export interface DealStoryLineDataItem {
    currency: string;
    displayName: string;
    layers: DealStoryLineLayer[];
    ratingId: number;
}

export interface DealStoryLinePreparedDataItem extends DealStoryLineDataItem {
    class: string;
    end: number;
    start: number;
}

const getBarClassName = (value: number, index: number, cumulative: number, total: number): string => {
    if (cumulative === 0) {
        return 'DealStoryLine__bar--base';
    }

    if (index === total - 1) {
        return 'DealStoryLine__bar--total';
    }

    return (value >= 0) ? 'DealStoryLine__bar--positive' : 'DealStoryLine__bar--negative';
};

const getStartValue = (cumulative: number, endValue: number, index: number, total: number): number => {
    if (index === total - 1) {
        return 0;
    }

    return endValue === cumulative ? cumulative * 0.99 : cumulative;
};

const getEndValue = (itemValue: number, cumulative: number): number => {
    return cumulative === 0 ? itemValue : cumulative - (cumulative - itemValue);
};

export const prepareData = (data: DealStoryLineDataItem[], layer: number = 0, value: string = 'loss'): DealStoryLinePreparedDataItem[] => {
    const preparedData: DealStoryLinePreparedDataItem[] = [];

    let cumulative: number = 0;
    for (let i = 0; i < data.length; i++) {
        const itemValue = data[i].layers[layer][value];
        if (!itemValue) {
            continue;
        }

        const endValue: number = getEndValue(itemValue, cumulative);

        const preparedDataItem: DealStoryLinePreparedDataItem = {
            ...data[i],
            class: getBarClassName(endValue, i, cumulative, data.length),
            end: endValue,
            start: getStartValue(cumulative, endValue, i, data.length),
        };

        preparedData.push(preparedDataItem);
        cumulative = endValue;
    }

    return preparedData;
};
