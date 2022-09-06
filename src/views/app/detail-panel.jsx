/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';
import { useRouteMatch, Switch, Route } from 'react-router-dom';
import { Container } from '@zextras/carbonio-design-system';
import ContactPreviewPanel from '../preview/contact-preview-panel';
import SelectionInteractive from './selection-interactive';
import ContactEditPanel from '../edit/contact-edit-panel';

const DetailPanel = ({ width }) => {
	const { path } = useRouteMatch();
	return (
		<Container width={width ?? '60%'} mainAlignment="flex-start">
			<Switch>
				<Route exact path={`${path}/folder/:folderId`}>
					<SelectionInteractive />
				</Route>
				<Route exact path={`${path}/folder/:folderId/contacts/:contactId`}>
					<ContactPreviewPanel />
				</Route>
				<Route exact path={`${path}/folder/:folderId/edit/:editId`}>
					<ContactEditPanel />
				</Route>
			</Switch>
		</Container>
	);
};

export default DetailPanel;
