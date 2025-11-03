/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { testUtils } from '@zextras/carbonio-shell-ui';
import { vi } from 'vitest';

import ContactPreviewContent from 'legacy/views/preview/contact-preview-content';

describe('Contact Preview Content', () => {
	let prevWidth;
	let prevHeight;

	beforeAll(() => {
		// Store the default value
		prevHeight = window.innerHeight;
		prevWidth = window.innerWidth;
	});

	afterEach(() => {
		// Reset to the default values
		Object.assign(window, {
			innerWidth: prevWidth,
			innerHeight: prevHeight
		});
	});

	test.skip('Contact Preview Content Desktop', async () => {
		Object.assign(window, {
			innerWidth: 1024,
			innerHeight: 768
		});
		// const contact = populateContact(7);
		const ctxt = {};
		testUtils.render(
			<ContactPreviewContent
				// contact={contact}
				onEdit={vi.fn()}
				onDelete={vi.fn()}
				onPrint={vi.fn()}
				onArchieve={vi.fn()}
				onMail={vi.fn()}
				//	onClose={vi.fn()}
			/>,
			{ ctxt }
		);
		// Uncomment this line to see the DOM content.

		// screen.debug();
		// expect(screen.getByTestId('contact-preview-content-desktop')).toBeInTheDocument();
	});

	test.skip('Contact Preview Content Mobile', async () => {
		Object.assign(window, {
			innerWidth: 768,
			innerHeight: 1024
		});
		// const contact = populateContact(7);
		const ctxt = {};
		testUtils.render(
			<ContactPreviewContent
				// contact={contact}
				onEdit={vi.fn()}
				onDelete={vi.fn()}
				onPrint={vi.fn()}
				onArchieve={vi.fn()}
				onMail={vi.fn()}
				//	onClose={vi.fn()}
			/>,
			{ ctxt }
		);
		// Uncomment this line to see the DOM content.

		// screen.debug();
		// expect(screen.getByTestId('contact-preview-content-mobile')).toBeInTheDocument();
	});
});
