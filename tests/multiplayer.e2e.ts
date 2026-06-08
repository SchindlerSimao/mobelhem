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
	await page.click('button:has-text("Creer")');

	// Wait for room page to load
	await page.waitForURL(/\/room\//);
	console.log('Host navigated to:', page.url());

	// Wait 2 seconds for socket connection and room creation
	await page.waitForTimeout(2000);

	const codeElement = page.locator('p.text-4xl');
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
	await guestPage.fill('input[placeholder="pseudo..."]', 'GuestPlayer');
	await guestPage.click('button:has-text("Rejoindre")');

	// Wait 2 seconds for guest to join
	await guestPage.waitForTimeout(2000);

	// Check player lists on both pages
	const hostPlayers = await page.locator('div.border-border >> text=HostPlayer').isVisible();
	const hostGuestVisible = await page
		.locator('div.border-border >> text=GuestPlayer')
		.isVisible();
	const guestPlayers = await guestPage
		.locator('div.border-border >> text=GuestPlayer')
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
	await page.click('button:has-text("Creer")');

	// Wait for room page to load
	await page.waitForURL(/\/room\//);
	await page.waitForTimeout(2000);

	const codeElement = page.locator('p.text-4xl');
	const roomCode = (await codeElement.innerText()).trim();

	// Now open a second page (guest) in a new context
	const browser = context.browser();
	if (!browser) throw new Error('Browser is null');
	const guestContext = await browser.newContext();
	const guestPage = await guestContext.newPage();

	// Guest goes to the room URL
	await guestPage.goto(`/room/${roomCode}`);

	// Guest should see the pseudo entry screen and type the SAME username
	await guestPage.fill('input[placeholder="pseudo..."]', 'DupName');
	await guestPage.click('button:has-text("Rejoindre")');

	// Wait 2 seconds for guest to join
	await guestPage.waitForTimeout(2000);

	// Both should see exactly 2 entries with "DupName" in their respective player lists
	const hostCount = await page.locator('div.border-border >> text=DupName').count();
	const guestCount = await guestPage.locator('div.border-border >> text=DupName').count();

	console.log(`Host list elements: ${hostCount}`);
	console.log(`Guest list elements: ${guestCount}`);

	expect(hostCount).toBe(2);
	expect(guestCount).toBe(2);
});

test('multiplayer full game loop', async ({ page, context }) => {
	// Set longer timeout for this test as it goes through all 10 rounds (each has 7s delay)
	test.setTimeout(120000);

	// Go to home page
	await page.goto('/');
	await page.click('text=Multijoueur');
	await page.fill('input#multi-pseudo', 'HostP');
	await page.click('button:has-text("Creer")');

	// Wait for room page to load
	await page.waitForURL(/\/room\//);
	await page.waitForTimeout(2000);

	const codeElement = page.locator('p.text-4xl');
	const roomCode = (await codeElement.innerText()).trim();

	// Now open a second page (guest) in a new context
	const browser = context.browser();
	if (!browser) throw new Error('Browser is null');
	const guestContext = await browser.newContext();
	const guestPage = await guestContext.newPage();

	// Guest joins the room
	await guestPage.goto(`/room/${roomCode}`);
	await guestPage.fill('input[placeholder="pseudo..."]', 'GuestP');
	await guestPage.click('button:has-text("Rejoindre")');

	// Wait for guest to join on host page
	await expect(page.locator('text=GuestP')).toBeVisible({ timeout: 10000 });

	// Host starts the game
	await page.click('button:has-text("Commencer")');

	// Loop through all 10 rounds
	for (let round = 0; round < 10; round++) {
		// Wait for the word / question text to be visible on both pages
		const hostWordLocator = page.locator('h2');
		await expect(hostWordLocator).toBeVisible({ timeout: 10000 });
		
		// Vote on both pages
		await page.click('button:has-text("Meuble IKEA")');
		await guestPage.click('button:has-text("Ville Scandinave")');

		// Wait for the feedback screen showing results
		await expect(page.locator('text=classement manche')).toBeVisible({ timeout: 10000 });
		await expect(guestPage.locator('text=classement manche')).toBeVisible({ timeout: 10000 });

		// Wait for the next round transition (delay is 7 seconds)
		if (round < 9) {
			await page.waitForTimeout(8000);
		}
	}

	// Game should end. Check for final leaderboard screen.
	await expect(page.locator('text=Classement final')).toBeVisible({ timeout: 15000 });
	await expect(guestPage.locator('text=Classement final')).toBeVisible({ timeout: 15000 });

	// Verify both players are listed in the final leaderboard
	const hostFinalHost = await page.locator('text=HostP').isVisible();
	const hostFinalGuest = await page.locator('text=GuestP').isVisible();
	expect(hostFinalHost).toBe(true);
	expect(hostFinalGuest).toBe(true);
});
