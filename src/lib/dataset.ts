export interface GameItem {
	name: string;
	type: 'ikea' | 'city' | 'both';
	country: 'SE' | 'NO' | 'DK' | 'FI' | null;
	lat?: number;
	lng?: number;
	cityDesc?: string;
}
