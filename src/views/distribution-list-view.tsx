/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react';

import { ModalManager } from '@zextras/carbonio-design-system';
import { Route, Routes } from 'react-router-dom';

import { ROUTES, ROUTES_INTERNAL_PARAMS } from '../constants';
import { DistributionListsView } from './distribution-list/distribution-lists-view';

const AppView = (): React.JSX.Element => (
	<ModalManager>
		<DistributionListsView />
	</ModalManager>
);

const MainRouteAppView = (): React.JSX.Element => (
	<Routes>
		<Route
			path={`${ROUTES_INTERNAL_PARAMS.route.distributionLists}${ROUTES.distributionLists}`}
			element={<AppView />}
		/>
	</Routes>
);

export default MainRouteAppView;
