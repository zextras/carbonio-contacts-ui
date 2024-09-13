/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { Suspense, lazy, useState, useEffect } from 'react';

import { Container } from '@zextras/carbonio-design-system';
import { setAppContext, Spinner } from '@zextras/carbonio-shell-ui';
import { Redirect, Switch, Route, useRouteMatch } from 'react-router-dom';

import { useUpdateView } from '../carbonio-ui-commons/hooks/use-update-view';

const LazyFolderView = lazy(
	() => import(/* webpackChunkName: "folder-panel-view" */ '../legacy/views/app/folder-view')
);

const LazyContactGroups = lazy(
	() => import(/* webpackChunkName: "folder-panel-view" */ './contact-groups/cg-view')
);

const ContactsView = (): React.JSX.Element => {
	const { path } = useRouteMatch();
	const [count, setCount] = useState(0);
	useUpdateView();

	useEffect(() => {
		setAppContext({ count, setCount });
	}, [count]);

	return (
		<Container orientation="horizontal" mainAlignment="flex-start">
			<Switch>
				<Route path={`${path}/contact-groups/:id?`}>
					<Suspense fallback={<Spinner />}>
						<LazyContactGroups />
					</Suspense>
				</Route>
				<Redirect strict from={path} to={`${path}/folder/7`} />
			</Switch>
			<LazyFolderView />
		</Container>
	);
};

export default ContactsView;
