import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock matchMedia for jsdom before importing the Svelte component
if (typeof window !== 'undefined') {
	window.matchMedia = vi.fn().mockImplementation((query) => ({
		matches: false,
		media: query,
		onchange: null,
		addListener: vi.fn(),
		removeListener: vi.fn(),
		addEventListener: vi.fn(),
		removeEventListener: vi.fn(),
		dispatchEvent: vi.fn()
	}));
}

import { mount, flushSync } from 'svelte';
import ThemeToggle from './ThemeToggle.svelte';

describe('ThemeToggle Component', () => {
	beforeEach(() => {
		localStorage.clear();
		document.documentElement.removeAttribute('data-theme');
	});

	it('should render and toggle theme on click', () => {
		const target = document.createElement('div');
		document.body.appendChild(target);

		mount(ThemeToggle, { target });
		flushSync();

		// Default theme is light in Svelte component initialization state (since prefersDark is mocked to false)
		expect(document.documentElement.getAttribute('data-theme')).toBe('light');

		const button = target.querySelector('button');
		expect(button).not.toBeNull();

		// Click to toggle to dark theme
		button?.click();
		flushSync();

		expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
		expect(localStorage.getItem('theme')).toBe('dark');

		// Click to toggle back to light theme
		button?.click();
		flushSync();

		expect(document.documentElement.getAttribute('data-theme')).toBe('light');
		expect(localStorage.getItem('theme')).toBe('light');

		target.remove();
	});
});
