export type EventSummary = {
  address?: `0x${string}`;
  title: string;
  location: string;
  date: string;
  priceMon: string;
  sold: number;
  total: number;
  soldOut?: boolean;
};
