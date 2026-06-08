import { describe, it, expect } from 'vitest';
import { mount } from 'svelte';
import Card from './Card.svelte';

describe('Card Component', () => {
	it('should render children and apply padding class', () => {
		const target = document.createElement('div');
		document.body.appendChild(target);

		mount(Card, {
			target,
			props: {
				padding: true,
				children: (anchor) => {
					const el = document.createTextNode('Card content');
					anchor.parentNode?.insertBefore(el, anchor);
				}
			}
		});

		expect(target.innerHTML).toContain('Card content');
		expect(target.firstElementChild?.className).toContain('p-6');
		target.remove();
	});

	it('should disable padding class if padding is false', () => {
		const target = document.createElement('div');
		document.body.appendChild(target);

		mount(Card, {
			target,
			props: {
				padding: false
			}
		});

		expect(target.firstElementChild?.className).not.toContain('p-6');
		target.remove();
	});
});
