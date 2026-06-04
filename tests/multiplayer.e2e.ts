import { test, expect } from '@playwright/test';

test('multiplayer room creation and joining', async ({ page, context }) => {
	// Enable console log capture
	page.on('console', (msg) => console.log(`[Host Page]: ${msg.text()}`));
	page.on('pageerror', (err) => console.error(`[Host Page Error]: ${err.message}`));

	// Go to home page
	await page.goto('/');

	// Switch to multiplayer tab
	await page.click('text=Multijoueur');

	// Fill username
	await page.fill('input#multi-pseudo', 'HostPlayer');

	// Click create room
	await page.click('button:has-text("Créer un Salon")');

	// Wait for room page to load
	await page.waitForURL(/\/room\//);
	console.log('Host navigated to:', page.url());

	// Wait 2 seconds for socket connection and room creation
	await page.waitForTimeout(2000);

	const codeElement = page.locator('h2');
	const roomCode = (await codeElement.innerText()).trim();
	console.log('Detected room code on host page:', roomCode);

	// Now open a second page (guest) in a new context
	const browser = context.browser();
	if (!browser) throw new Error('Browser is null');
	const guestContext = await browser.newContext();
	const guestPage = await guestContext.newPage();
	guestPage.on('console', (msg) => console.log(`[Guest Page]: ${msg.text()}`));
	guestPage.on('pageerror', (err) => console.error(`[Guest Page Error]: ${err.message}`));

	// Guest goes to the room URL
	const roomUrl = `/room/${roomCode}`;
	console.log('Guest navigating to:', roomUrl);
	await guestPage.goto(roomUrl);

	// Guest should see the pseudo entry screen
	await guestPage.fill('input[placeholder="Votre pseudonyme..."]', 'GuestPlayer');
	await guestPage.click('button:has-text("Confirmer et Rejoindre")');

	// Wait 2 seconds for guest to join
	await guestPage.waitForTimeout(2000);

	// Check player lists on both pages
	const hostPlayers = await page.locator('div.border-slate-850 >> text=HostPlayer').isVisible();
	const hostGuestVisible = await page
		.locator('div.border-slate-850 >> text=GuestPlayer')
		.isVisible();
	const guestPlayers = await guestPage
		.locator('div.border-slate-850 >> text=GuestPlayer')
		.isVisible();

	console.log('Host sees HostPlayer:', hostPlayers);
	console.log('Host sees GuestPlayer:', hostGuestVisible);
	console.log('Guest sees GuestPlayer:', guestPlayers);

	// Take screenshots
	await page.screenshot({ path: 'playwright-host.png' });
	await guestPage.screenshot({ path: 'playwright-guest.png' });

	expect(roomCode).not.toBe('NEW');
	expect(hostGuestVisible).toBe(true);
});

test('multiplayer room duplicate usernames', async ({ page, context }) => {
	// Go to home page
	await page.goto('/');

	// Switch to multiplayer tab
	await page.click('text=Multijoueur');

	// Fill username
	await page.fill('input#multi-pseudo', 'DupName');

	// Click create room
	await page.click('button:has-text("Créer un Salon")');

	// Wait for room page to load
	await page.waitForURL(/\/room\//);
	await page.waitForTimeout(2000);

	const codeElement = page.locator('h2');
	const roomCode = (await codeElement.innerText()).trim();

	// Now open a second page (guest) in a new context
	const browser = context.browser();
	if (!browser) throw new Error('Browser is null');
	const guestContext = await browser.newContext();
	const guestPage = await guestContext.newPage();

	// Guest goes to the room URL
	await guestPage.goto(`/room/${roomCode}`);

	// Guest should see the pseudo entry screen and type the SAME username
	await guestPage.fill('input[placeholder="Votre pseudonyme..."]', 'DupName');
	await guestPage.click('button:has-text("Confirmer et Rejoindre")');

	// Wait 2 seconds for guest to join
	await guestPage.waitForTimeout(2000);

	// Both should see exactly 2 entries with "DupName" in their respective player lists
	const hostCount = await page.locator('div.border-slate-850 >> text=DupName').count();
	const guestCount = await guestPage.locator('div.border-slate-850 >> text=DupName').count();

	console.log(`Host list elements: ${hostCount}`);
	console.log(`Guest list elements: ${guestCount}`);

	expect(hostCount).toBe(2);
	expect(guestCount).toBe(2);
});
