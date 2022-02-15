/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { testUtils, replaceHistory } from '@zextras/carbonio-shell-ui';
import React from 'react';
// import { screen } from '@testing-library/react';
import reducers from '../../store/reducers/reducers';
import ContactPreviewPanel from './contact-preview-panel';

describe.skip('Preview Panel', () => {
	test('Render preview', async () => {
		replaceHistory.mockImplementation(() => jest.fn());
		const ctxt = {};
		const folderId = 7;
		const itemsCount = 1;

		testUtils.render(<ContactPreviewPanel contactInternalId="2000" folderId={folderId} />, {
			ctxt,
			reducer: reducers,
			preloadedState: {
				folders: {
					status: 'succeeded',
					folders: {
						[folderId]: {
							id: folderId,
							itemsCount,
							name: 'Contacts',
							parent: '1',
							path: '/Contacts',
							size: 0,
							unreadCount: 0
						}
					}
				},
				sync: {
					status: 'idle',
					intervalId: 5,
					token: '1'
				},
				contacts: {
					status: 'succeeded'
					// contacts: populateContactSlice(7, 1, '2000')
				}
			}
		});

		const contact = ctxt.current.store.getState().contacts.contacts[folderId][0];

		// expect(screen.getByTestId('PreviewPanel')).toBeInTheDocument();
		// expect(screen.getByTestId('PreviewPanel')).toBeVisible();
		// expect(screen.getByTestId('PreviewPanel')).not.toBeEmptyDOMElement();
		// expect(screen.getByTestId('PreviewPanel')).toHaveTextContent(contact.firstName);
		// expect(screen.getByTestId('PreviewPanel')).toHaveTextContent(contact.lastName);
		// expect(screen.getByTestId('PreviewPanel')).toHaveTextContent(contact.company);
		// expect(screen.getByTestId('PreviewPanel')).toHaveTextContent(contact.department);
		// expect(screen.getByTestId('PreviewPanel')).toHaveTextContent(contact.nameSuffix);
		// expect(screen.getByTestId('PreviewPanel')).toHaveTextContent(contact.namePrefix);
	});
});
