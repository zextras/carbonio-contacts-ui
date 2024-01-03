/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { useMemo } from 'react';

import { ModalManager, ThemeProvider } from '@zextras/carbonio-design-system';
import { trimEnd } from 'lodash';
import { Route, useRouteMatch } from 'react-router-dom';

import { ContactGroupsView } from './ContactGroupsView';
import { ROUTES } from '../constants';

const AppView = (): React.JSX.Element => {
	const { path } = useRouteMatch();

	const routes = useMemo(
		() => (
			<Route path={`${trimEnd(path, '/')}${ROUTES.contactGroup}`} component={ContactGroupsView} />
		),
		[path]
	);

	return (
		<ThemeProvider loadDefaultFont={false}>
			<ModalManager>{routes}</ModalManager>
		</ThemeProvider>
	);
};

export default AppView;
