/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { useMemo } from 'react';

import { ModalManager, ThemeProvider } from '@zextras/carbonio-design-system';
import { trimEnd } from 'lodash';
import { Route, Switch, useRouteMatch } from 'react-router-dom';

import { CGView } from './cg-view';
import { RouteParams, ROUTES, ROUTES_INTERNAL_PARAMS } from '../constants';

const AppView = (): React.JSX.Element => {
	const { path, params } = useRouteMatch<RouteParams>();

	const trimmedPath = useMemo(() => trimEnd(path, '/'), [path]);

	const routes = useMemo(
		() => (
			<Switch>
				{params.route === ROUTES_INTERNAL_PARAMS.route.contactGroups && (
					<Route path={`${trimmedPath}${ROUTES.contactGroups}`} component={CGView} />
				)}
			</Switch>
		),
		[trimmedPath, params]
	);

	return (
		<ThemeProvider loadDefaultFont={false}>
			<ModalManager>{routes}</ModalManager>
		</ThemeProvider>
	);
};

const MainRouteAppView = (): React.JSX.Element => {
	const { path } = useRouteMatch();

	const trimmedPath = useMemo(() => trimEnd(path, '/'), [path]);

	return <Route path={`${trimmedPath}${ROUTES.mainRoute}`} component={AppView} />;
};

export default MainRouteAppView;
