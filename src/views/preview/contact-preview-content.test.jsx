/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';
// import { screen } from '@testing-library/react';
import { testUtils } from '@zextras/zapp-shell';
// import { populateContact } from '../../mocks/populate-contact';
import ContactPreviewContent from './contact-preview-content';

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

	test('Contact Preview Content Desktop', async () => {
		Object.assign(window, {
			innerWidth: 1024,
			innerHeight: 768
		});
		// const contact = populateContact(7);
		const ctxt = {};
		testUtils.render(
			<ContactPreviewContent
				// contact={contact}
				onEdit={jest.fn()}
				onDelete={jest.fn()}
				onPrint={jest.fn()}
				onArchieve={jest.fn()}
				onMail={jest.fn()}
				//	onClose={jest.fn()}
			/>,
			{ ctxt }
		);
		// Uncomment this line to see the DOM content.

		// screen.debug();
		// expect(screen.getByTestId('contact-preview-content-desktop')).toBeInTheDocument();
	});

	test('Contact Preview Content Mobile', async () => {
		Object.assign(window, {
			innerWidth: 768,
			innerHeight: 1024
		});
		// const contact = populateContact(7);
		const ctxt = {};
		testUtils.render(
			<ContactPreviewContent
				// contact={contact}
				onEdit={jest.fn()}
				onDelete={jest.fn()}
				onPrint={jest.fn()}
				onArchieve={jest.fn()}
				onMail={jest.fn()}
				//	onClose={jest.fn()}
			/>,
			{ ctxt }
		);
		// Uncomment this line to see the DOM content.

		// screen.debug();
		// expect(screen.getByTestId('contact-preview-content-mobile')).toBeInTheDocument();
	});
});
