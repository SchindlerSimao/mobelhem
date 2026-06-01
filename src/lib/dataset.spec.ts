import { describe, it, expect } from 'vitest';
import { dataset } from './dataset';

describe('Möbelhem Game Dataset', () => {
	it('should contain a non-empty list of items', () => {
		expect(dataset.length).toBeGreaterThan(30);
	});

	it('should have valid item structures', () => {
		dataset.forEach((item) => {
			expect(item.name).toBeDefined();
			expect(item.name.length).toBeGreaterThan(1);
			expect(item.type).toMatch(/^(ikea|city|both)$/);
			expect(item.funFact).toBeDefined();
			expect(item.funFact.length).toBeGreaterThan(10);

			if (item.type === 'city' || item.type === 'both') {
				expect(item.country).toMatch(/^(SE|NO|DK|FI)$/);
				expect(item.lat).toBeDefined();
				expect(item.lng).toBeDefined();
				expect(item.lat).toBeGreaterThan(50); // Scandinavia latitude boundary
				expect(item.lng).toBeGreaterThan(4); // Scandinavia longitude boundary
			}

			if (item.type === 'ikea' || item.type === 'both') {
				expect(item.ikeaDesc).toBeDefined();
				expect(item.ikeaDesc!.length).toBeGreaterThan(10);
			}

			if (item.type === 'city') {
				expect(item.cityDesc).toBeDefined();
				expect(item.cityDesc!.length).toBeGreaterThan(10);
			}
		});
	});
});
