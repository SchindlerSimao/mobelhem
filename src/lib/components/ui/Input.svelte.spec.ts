import { describe, it, expect } from 'vitest';
import { mount } from 'svelte';
import Input from './Input.svelte';

describe('Input Component', () => {
	it('should render with correct placeholder and value', () => {
		const target = document.createElement('div');
		document.body.appendChild(target);

		mount(Input, {
			target,
			props: {
				value: 'Hello',
				placeholder: 'Enter text...'
			}
		});

		const input = target.querySelector('input');
		expect(input).not.toBeNull();
		expect(input?.value).toBe('Hello');
		expect(input?.placeholder).toBe('Enter text...');
		target.remove();
	});
});
