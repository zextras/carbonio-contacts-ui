/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useState, useEffect } from 'react';

import { Container } from '@zextras/carbonio-design-system';
import { setAppContext } from '@zextras/carbonio-shell-ui';
import { Redirect, Route, useRouteMatch } from 'react-router-dom';

import { CGView } from './contact-groups/contact-groups-view';
import { useUpdateView } from '../carbonio-ui-commons/hooks/use-update-view';
import { FolderView } from '../legacy/views/app/folder-view';

const ContactsView = (): React.JSX.Element => {
	const { path } = useRouteMatch();
	const [count, setCount] = useState(0);
	useUpdateView();

	useEffect(() => {
		setAppContext({ count, setCount });
	}, [count]);

	return (
		<Container orientation="horizontal" mainAlignment="flex-start">
			<Route path={path}>
				<CGView />
				<FolderView />
				<Redirect strict from={path} to={`${path}/folder/7`} />
			</Route>
		</Container>
	);
};

export default ContactsView;
