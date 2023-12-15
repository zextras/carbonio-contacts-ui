/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

// import { screen } from '@testing-library/react';
import { testUtils } from '@zextras/carbonio-shell-ui';

import ContactPreviewHeader from './contact-preview-header';

describe.skip('Contact Preview Header', () => {
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

	test('Render Contact Preview Header Desktop', async () => {
		Object.assign(window, {
			innerWidth: 1024,
			innerHeight: 768
		});
		// const displayName = `${faker.person.firstName()} ${faker.person.lastName()}`;
		const ctxt = {};
		testUtils.render(
			<ContactPreviewHeader
				// displayName={displayName}
				onClose={jest.fn()}
				onEdit={jest.fn()}
				onDelete={jest.fn()}
			/>,
			{ ctxt }
		);
		// Uncomment this line to see the DOM content.
		// screen.debug();
		// expect(screen.getByText(displayName)).toBeInTheDocument();
		// expect(screen.getByTestId('contact-preview-header-desktop')).toBeInTheDocument();
	});

	test('Render Contact Preview Header Mobile', async () => {
		Object.assign(window, {
			innerWidth: 768,
			innerHeight: 1024
		});
		// const displayName = `${faker.person.firstName()} ${faker.person.lastName()}`;
		const ctxt = {};
		testUtils.render(
			<ContactPreviewHeader
				// displayName={displayName}
				onClose={jest.fn()}
				onEdit={jest.fn()}
				onDelete={jest.fn()}
			/>,
			{ ctxt }
		);
		// Uncomment this line to see the DOM content.
		// screen.debug();
		// expect(screen.getByText(displayName)).toBeInTheDocument();
		// expect(screen.getByTestId('contact-preview-header-mobile')).toBeInTheDocument();
	});
});
