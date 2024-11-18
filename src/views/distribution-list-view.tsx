/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { useMemo } from 'react';

import { ModalManager, ThemeProvider } from '@zextras/carbonio-design-system';
import { trimEnd } from 'lodash';
import { Redirect, Route, Switch, useRouteMatch } from 'react-router-dom';

import { DistributionListsView } from './distribution-list/distribution-lists-view';
import { RouteParams, ROUTES, ROUTES_INTERNAL_PARAMS } from '../constants';

const AppView = (): React.JSX.Element => {
	const { path, params, url } = useRouteMatch<RouteParams>();

	const trimmedPath = useMemo(() => trimEnd(path, '/'), [path]);

	const routes = useMemo(
		() => (
			<Switch>
				{params.route === ROUTES_INTERNAL_PARAMS.route.distributionLists && (
					<Route path={`${trimmedPath}${ROUTES.distributionLists}`}>
						{({ match }): React.JSX.Element =>
							match?.params.filter &&
							Object.values<string>(ROUTES_INTERNAL_PARAMS.filter).includes(match.params.filter) ? (
								<DistributionListsView />
							) : (
								<Redirect to={`${url}/${ROUTES_INTERNAL_PARAMS.filter.member}`} />
							)
						}
					</Route>
				)}
			</Switch>
		),
		[params.route, trimmedPath, url]
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
