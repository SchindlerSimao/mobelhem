import { describe, it, expect } from 'vitest';
import { mount } from 'svelte';
import TimerBar from './TimerBar.svelte';

describe('TimerBar Component', () => {
	it('should render the correct time and styles', () => {
		const target = document.createElement('div');
		document.body.appendChild(target);

		mount(TimerBar, {
			target,
			props: {
				timeLeft: 15,
				max: 20
			}
		});

		expect(target.innerHTML).toContain('15');
		const progress = target.querySelector('.h-full');
		expect((progress as HTMLElement).style.width).toBe('75%');
		expect(progress?.className).toContain('bg-fg'); // normal state
		target.remove();
	});

	it('should apply warning color when time is urgent', () => {
		const target = document.createElement('div');
		document.body.appendChild(target);

		mount(TimerBar, {
			target,
			props: {
				timeLeft: 5,
				max: 60
			}
		});

		const progress = target.querySelector('.h-full');
		expect(progress?.className).toContain('bg-muted'); // urgent state
		target.remove();
	});

	it('should apply critical color and animation when time is critical', () => {
		const target = document.createElement('div');
		document.body.appendChild(target);

		mount(TimerBar, {
			target,
			props: {
				timeLeft: 2,
				max: 60
			}
		});

		const progress = target.querySelector('.h-full');
		expect(progress?.className).toContain('bg-danger');
		expect(progress?.className).toContain('animate-pulse');
		target.remove();
	});
});
