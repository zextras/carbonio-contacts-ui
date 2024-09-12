/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useMemo, Suspense } from 'react';

import { Container } from '@zextras/carbonio-design-system';
import { Spinner } from '@zextras/carbonio-shell-ui';
import { trimEnd } from 'lodash';
import { useRouteMatch, Switch, Route } from 'react-router-dom';

import { FolderPanel } from './folder-panel';
import SelectionInteractive from './selection-interactive';
import ContactEditPanel from '../edit/contact-edit-panel';
import ContactPreviewPanel from '../preview/contact-preview-panel';

const FolderView = (): React.JSX.Element => {
	const { path } = useRouteMatch();
	const trimmedPath = useMemo(() => trimEnd(path, '/'), [path]);
	return (
		<>
			<Switch>
				<Route path={`${trimmedPath}/:folderId/:type?/:itemId?`}>
					<Container width="40%" borderColor={{ right: 'gray3' }}>
						<Suspense fallback={<Spinner />}>
							<FolderPanel />
						</Suspense>
					</Container>
				</Route>
			</Switch>
			<Switch>
				<Container width={'60%'} mainAlignment="flex-start" data-testid="ContactDetailsContainer">
					<Route exact path={`${trimmedPath}/:folderId`}>
						<SelectionInteractive />
					</Route>
					<Route exact path={`${trimmedPath}/:folderId/contacts/:contactId`}>
						<ContactPreviewPanel />
					</Route>
					<Route exact path={`${trimmedPath}/:folderId/edit/:editId`}>
						<ContactEditPanel />
					</Route>
				</Container>
			</Switch>
		</>
	);
};

export default FolderView;
