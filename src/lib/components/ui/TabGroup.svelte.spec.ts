import { describe, it, expect, vi } from 'vitest';
import { mount } from 'svelte';
import TabGroup from './TabGroup.svelte';

describe('TabGroup Component', () => {
	it('should render all tabs and apply active style', () => {
		const target = document.createElement('div');
		document.body.appendChild(target);

		const tabs = [
			{ id: 'solo', label: 'Solo Play' },
			{ id: 'multi', label: 'Multiplayer' }
		];

		let active = 'solo';
		const onChange = vi.fn((id) => {
			active = id;
		});

		mount(TabGroup, {
			target,
			props: {
				tabs,
				active,
				onChange
			}
		});

		const buttons = target.querySelectorAll('button');
		expect(buttons.length).toBe(2);
		expect(buttons[0].textContent?.trim()).toBe('Solo Play');
		expect(buttons[0].getAttribute('aria-selected')).toBe('true');
		expect(buttons[1].textContent?.trim()).toBe('Multiplayer');
		expect(buttons[1].getAttribute('aria-selected')).toBe('false');

		// Click tab
		buttons[1].click();
		expect(onChange).toHaveBeenCalledWith('multi');

		target.remove();
	});
});
