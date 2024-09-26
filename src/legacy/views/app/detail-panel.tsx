/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useMemo } from 'react';

import { Container } from '@zextras/carbonio-design-system';
import { trimEnd } from 'lodash';
import { Route, Switch, useRouteMatch } from 'react-router-dom';

import SelectionInteractive from './selection-interactive';
import ContactEditPanel from '../edit/contact-edit-panel';
import ContactPreviewPanel from '../preview/contact-preview-panel';

export const DetailPanel = (): React.JSX.Element => {
	const { path } = useRouteMatch();
	const trimmedPath = useMemo(() => trimEnd(path, '/'), [path]);
	return (
		<Switch>
			<Route exact path={`${trimmedPath}/folder/:folderId`}>
				<Container width={'60%'} mainAlignment="flex-start" data-testid="ContactDetailsContainer">
					<SelectionInteractive />
				</Container>
			</Route>
			<Route exact path={`${trimmedPath}/folder/:folderId/contacts/:contactId`}>
				<Container width={'60%'} mainAlignment="flex-start" data-testid="ContactDetailsContainer">
					<ContactPreviewPanel />
				</Container>
			</Route>
			<Route exact path={`${trimmedPath}/folder/:folderId/edit/:editId`}>
				<Container width={'60%'} mainAlignment="flex-start" data-testid="ContactDetailsContainer">
					<ContactEditPanel />
				</Container>
			</Route>
		</Switch>
	);
};
