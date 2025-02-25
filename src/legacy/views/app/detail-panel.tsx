/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { Container } from '@zextras/carbonio-design-system';
import { Route, Routes } from 'react-router-dom';

import SelectionInteractive from './selection-interactive';
import { ContactGroupDisplayer } from '../../../views/contact-groups/displayer/contact-group-displayer';
import ContactEditPanel from '../edit/contact-edit-panel';
import ContactPreviewPanel from '../preview/contact-preview-panel';

export const DetailPanel = (): React.JSX.Element => (
	<Routes>
		<Route
			path={'folder/:folderId'}
			element={
				<Container width={'60%'} mainAlignment="flex-start" data-testid="ContactDetailsContainer">
					<SelectionInteractive />
				</Container>
			}
		/>
		<Route
			path={'folder/:folderId/contacts/:contactId'}
			element={
				<Container width={'60%'} mainAlignment="flex-start" data-testid="ContactDetailsContainer">
					<ContactPreviewPanel />
				</Container>
			}
		/>
		<Route
			path={'folder/:folderId/contact-groups/:id'}
			element={
				<Container width={'60%'} mainAlignment="flex-start" data-testid="ContactDetailsContainer">
					<ContactGroupDisplayer />
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
