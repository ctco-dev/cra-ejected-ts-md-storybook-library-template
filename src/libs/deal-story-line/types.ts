export interface DealStoryLineOptions {
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