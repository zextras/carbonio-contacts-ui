/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react';

import { ModalManager } from '@zextras/carbonio-design-system';
import { Navigate, Route, Routes, useParams } from 'react-router-dom';

import { ROUTES, ROUTES_INTERNAL_PARAMS } from 'constants/index';
import { DistributionListsView } from 'views/distribution-list/distribution-lists-view';

const AppView = (): React.JSX.Element => {
	const { filter } = useParams();
	if (
		filter !== ROUTES_INTERNAL_PARAMS.filter.member &&
		filter !== ROUTES_INTERNAL_PARAMS.filter.manager
	) {
		return (
			<Navigate
				to={`../${ROUTES_INTERNAL_PARAMS.route.distributionLists}/${ROUTES_INTERNAL_PARAMS.filter.member}`}
				replace
			/>
		);
	}
	return (
		<ModalManager>
			<DistributionListsView />
		</ModalManager>
	);
};

const MainRouteAppView = (): React.JSX.Element => (
	<Routes>
		<Route
			path={`${ROUTES_INTERNAL_PARAMS.route.distributionLists}${ROUTES.distributionLists}`}
			element={<AppView />}
		/>
	</Routes>
);

export default MainRouteAppView;
