/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';
// import { screen } from '@testing-library/react';
import { testUtils } from '@zextras/carbonio-shell-ui';
import reducers from '../../store/reducers/reducers';
import ContactEditPanel from './contact-edit-panel';
// import { populateContactSlice } from '../../mocks/populate-contacts-slice';

describe.skip('Edit view', () => {
	test('Render editView', async () => {
		const ctxt = {};
		const folderId = '7';
		const itemsCount = 1;

		testUtils.render(<ContactEditPanel editPanelId="2000" folderId={folderId} />, {
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
					// contacts: populateContactSlice(folderId, itemsCount, '2000')
				}
			}
		});

		const contact = ctxt.current.store.getState().contacts.contacts[7][0];

		// expect(screen.getByTestId('EditContact')).toBeInTheDocument();
		// expect(screen.getByTestId('EditContact')).toBeVisible();
		// expect(screen.getByTestId('EditContact')).not.toBeEmptyDOMElement();
		// expect(screen.getByTestId('EditContact')).toHaveTextContent(contact.firstName);
		// expect(screen.getByTestId('EditContact')).toHaveTextContent(contact.lastName);
		// expect(screen.getByTestId('EditContact')).toHaveTextContent(contact.company);
		// expect(screen.getByTestId('EditContact')).toHaveTextContent(contact.department);
		// expect(screen.getByTestId('EditContact')).toHaveTextContent(contact.nameSuffix);
		// expect(screen.getByTestId('EditContact')).toHaveTextContent(contact.namePrefix);
	});
});
