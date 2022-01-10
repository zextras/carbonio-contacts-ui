/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, lazy, Suspense } from 'react';
import { Switch, Route, useRouteMatch } from 'react-router-dom';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { Spinner } from '@zextras/zapp-shell';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const LazyEditView = lazy(() => import(/* webpackChunkName: "edit-view" */ '../edit/edit-view'));

const BoardView: FC<{ windowHistory: History }> = ({ windowHistory }) => {
	const { path } = useRouteMatch();
	return (
		<Switch>
			<Route path={`${path}/new`}>
				<Suspense fallback={<Spinner />}>
					<LazyEditView />
				</Suspense>
			</Route>
		</Switch>
	);
};

export default BoardView;
