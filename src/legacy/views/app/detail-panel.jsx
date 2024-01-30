/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useMemo } from 'react';

import { Container } from '@zextras/carbonio-design-system';
import { trimEnd } from 'lodash';
import { useRouteMatch, Switch, Route } from 'react-router-dom';

import SelectionInteractive from './selection-interactive';
import ContactEditPanel from '../edit/contact-edit-panel';
import ContactPreviewPanel from '../preview/contact-preview-panel';

const DetailPanel = ({ width }) => {
	const { path } = useRouteMatch();
	const trimmedPath = useMemo(() => trimEnd(path, '/'), [path]);
	return (
		<Container
			width={width ?? '60%'}
			mainAlignment="flex-start"
			data-testid="ContactDetailsContainer"
		>
			<Switch>
				<Route exact path={`${trimmedPath}/folder/:folderId`}>
					<SelectionInteractive />
				</Route>
				<Route exact path={`${trimmedPath}/folder/:folderId/contacts/:contactId`}>
					<ContactPreviewPanel />
				</Route>
				<Route exact path={`${trimmedPath}/folder/:folderId/edit/:editId`}>
					<ContactEditPanel />
				</Route>
			</Switch>
		</Container>
	);
};

export default DetailPanel;
