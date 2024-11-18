/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { Suspense, useMemo } from 'react';

import { Container } from '@zextras/carbonio-design-system';
import { Spinner } from '@zextras/carbonio-shell-ui';
import { trimEnd } from 'lodash';
import { Route, Switch, useRouteMatch } from 'react-router-dom';

import { FolderPanel } from './folder-panel';

export const FolderListPanel = (): React.JSX.Element => {
	const { path } = useRouteMatch();
	const trimmedPath = useMemo(() => trimEnd(path, '/'), [path]);
	return (
		<Switch>
			<Route path={`${trimmedPath}/folder/:folderId/:type?/:itemId?`}>
				<Container width="40%" borderColor={{ right: 'gray3' }}>
					<Suspense fallback={<Spinner />}>
						<FolderPanel />
					</Suspense>
				</Container>
			</Route>
		</Switch>
	);
};
