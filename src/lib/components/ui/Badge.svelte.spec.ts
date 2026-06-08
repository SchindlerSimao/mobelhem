import { describe, it, expect } from 'vitest';
import { mount } from 'svelte';
import Badge from './Badge.svelte';

describe('Badge Component', () => {
	it('should render label and value', () => {
		const target = document.createElement('div');
		document.body.appendChild(target);

		mount(Badge, {
			target,
			props: {
				label: 'Score',
				value: 120
			}
		});

		// Check rendered content
		expect(target.innerHTML).toContain('Score');
		expect(target.innerHTML).toContain('120');

		// Cleanup
		target.remove();
	});

	it('should apply custom class name', () => {
		const target = document.createElement('div');
		document.body.appendChild(target);

		mount(Badge, {
			target,
			props: {
				label: 'Round',
				value: '1/10',
				class: 'my-custom-class'
			}
		});

		expect(target.firstElementChild?.classList.contains('my-custom-class')).toBe(true);

		target.remove();
	});
});
