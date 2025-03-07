/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { Container } from '@zextras/carbonio-design-system';
import { Route, Routes } from 'react-router-dom';

import ContactsEmptyDisplayer from './contacts-empty-displayer';
import { ContactGroupDisplayerWrapper } from '../../../views/contact-groups/actions/contact-group-displayer-wrapper';
import ContactEditPanel from '../edit/contact-edit-panel';
import { ContactPreviewWrapper } from '../preview/contact-preview-wrapper';

export const DetailPanel = (): React.JSX.Element => (
	<Routes>
		<Route
			path={'folder/:folderId'}
			element={
				<Container width={'60%'} mainAlignment="flex-start" data-testid="ContactDetailsContainer">
					<ContactsEmptyDisplayer />
				</Container>
			}
		/>
		<Route
			path={'folder/:folderId/contacts/:contactId'}
			element={
				<Container width={'60%'} mainAlignment="flex-start" data-testid="ContactDetailsContainer">
					<ContactPreviewWrapper />
				</Container>
			}
		/>
		<Route
			path={'folder/:folderId/contact-groups/:id'}
			element={
				<Container width={'60%'} mainAlignment="flex-start" data-testid="ContactDetailsContainer">
					<ContactGroupDisplayerWrapper />
				</Container>
			}
		/>
		<Route
			path={'folder/:folderId/edit/:editId'}
			element={
				<Container width={'60%'} mainAlignment="flex-start" data-testid="ContactDetailsContainer">
					<ContactEditPanel />
				</Container>
			}
		/>
	</Routes>
);
