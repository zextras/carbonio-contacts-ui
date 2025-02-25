/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useState, useEffect } from 'react';

import { Container } from '@zextras/carbonio-design-system';
import { setAppContext } from '@zextras/carbonio-shell-ui';
import { redirect, Route, Routes } from 'react-router-dom';

import { useUpdateView } from '../carbonio-ui-commons/hooks/use-update-view';
import { FolderView } from '../legacy/views/app/folder-view';

const ContactsView = (): React.JSX.Element => {
	const [count, setCount] = useState(0);
	useUpdateView();

	useEffect(() => {
		setAppContext({ count, setCount });
	}, [count]);

	console.log('@@@@ContactsView');
	useEffect(() => {
		redirect('/folder/7');
	}, []);

	return (
		<Container orientation="horizontal" mainAlignment="flex-start">
			<Routes>
				<Route path="*" element={<FolderView />} />
			</Routes>
		</Container>
	);
};

export default ContactsView;
