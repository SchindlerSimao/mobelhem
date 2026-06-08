import { describe, it, expect } from 'vitest';
import { mount } from 'svelte';
import MapComponent from './Map.svelte';

describe('Map Component', () => {
	it('should render map container element', () => {
		const target = document.createElement('div');
		document.body.appendChild(target);

		mount(MapComponent, {
			target,
			props: {
				lat: 62.0,
				lng: 15.0,
				name: 'Test City',
				desc: 'A nice test city'
			}
		});

		expect(target.querySelector('.relative')).not.toBeNull();
		target.remove();
	});
});
