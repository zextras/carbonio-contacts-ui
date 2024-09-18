/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { useMemo } from 'react';

import { Container } from '@zextras/carbonio-design-system';
import { trimEnd } from 'lodash';
import { Route, useRouteMatch } from 'react-router-dom';

import { CGDisplayerController } from '../../components/cg-displayer-controller';
import { CGList } from '../../components/cg-list';
import { DISPLAYER_WIDTH } from '../../constants';

export const CGView = (): React.JSX.Element => {
	const { path } = useRouteMatch();
	const trimmedPath = useMemo(() => trimEnd(path, '/'), [path]);
	return (
		<Route path={`${trimmedPath}/contact-groups/:id?`}>
			<Container
				orientation="row"
				crossAlignment="flex-start"
				mainAlignment="flex-start"
				background="gray5"
				borderRadius="none"
			>
				<CGList />
				<Container
					width={DISPLAYER_WIDTH}
					mainAlignment="flex-start"
					crossAlignment="flex-start"
					borderRadius="none"
					maxHeight={'100%'}
				>
					<CGDisplayerController />
				</Container>
			</Container>
		</Route>
	);
};
