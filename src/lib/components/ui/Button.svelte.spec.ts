import { describe, it, expect } from 'vitest';
import { mount } from 'svelte';
import Button from './Button.svelte';

describe('Button Component', () => {
	it('should render children and apply variant class names', () => {
		const target = document.createElement('div');
		document.body.appendChild(target);

		mount(Button, {
			target,
			props: {
				variant: 'primary',
				children: (anchor) => {
					const el = document.createTextNode('Primary Action');
					anchor.parentNode?.insertBefore(el, anchor);
				}
			}
		});

		expect(target.innerHTML).toContain('Primary Action');
		expect(target.firstElementChild?.className).toContain('bg-accent');
		target.remove();
	});

	it('should disable button if disabled prop is true', () => {
		const target = document.createElement('div');
		document.body.appendChild(target);

		mount(Button, {
			target,
			props: {
				disabled: true
			}
		});

		const btn = target.querySelector('button');
		expect(btn?.disabled).toBe(true);
		target.remove();
	});
});
