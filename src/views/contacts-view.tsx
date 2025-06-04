/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useState, useEffect } from 'react';

import { Container } from '@zextras/carbonio-design-system';
import { setAppContext } from '@zextras/carbonio-shell-ui';
import { useUpdateView } from '@zextras/carbonio-ui-commons';
import { Navigate, Route, Routes } from 'react-router-dom';

import { FolderView } from '../legacy/views/app/folder-view';

const ContactsView = (): React.JSX.Element => {
	const [count, setCount] = useState(0);
	useUpdateView();

	useEffect(() => {
		setAppContext({ count, setCount });
	}, [count]);

	return (
		<Container orientation="horizontal" mainAlignment="flex-start">
			<FolderView />
			<Routes>
				<Route path="/" element={<Navigate to={'folder/7'} />} />
			</Routes>
		</Container>
	);
};

export default ContactsView;
