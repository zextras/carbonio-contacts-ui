/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { Suspense, lazy, useState, useEffect } from 'react';
import { Redirect, Switch, Route, useRouteMatch } from 'react-router-dom';
import { setAppContext, Spinner } from '@zextras/carbonio-shell-ui';
import { Container } from '@zextras/carbonio-design-system';

const LazyFolderView = lazy(() =>
	import(/* webpackChunkName: "folder-view" */ './app/folder-panel')
);

const LazyDetailPanel = lazy(() =>
	import(/* webpackChunkName: "folder-panel-view" */ './app/detail-panel')
);

const AppView = () => {
	const { path } = useRouteMatch();
	const [count, setCount] = useState(0);

	useEffect(() => {
		setAppContext({ count, setCount });
	}, [count]);

	return (
		<Container orientation="horizontal" mainAlignment="flex-start">
			<Container width="40%">
				<Switch>
					<Route path={`${path}/folder/:folderId/:type?/:itemId?`}>
						<Suspense fallback={<Spinner />}>
							<LazyFolderView />
						</Suspense>
					</Route>
					<Redirect strict from={path} to={`${path}/folder/7`} />
				</Switch>
			</Container>
			<Suspense fallback={<Spinner />}>
				<LazyDetailPanel />
			</Suspense>
		</Container>
	);
};

export default AppView;
