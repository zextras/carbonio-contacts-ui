/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { useMemo } from 'react';

import { Container } from '@zextras/carbonio-design-system';
import { trimEnd } from 'lodash';
import { Route, Switch, useRouteMatch } from 'react-router-dom';

import { ContactGroupDisplayerMainAccount } from './displayer/contact-group-displayer-main-account';
import { ContactGroupDisplayerShared } from './displayer/contact-group-displayer-shared';
import { ContactGroupListMainAccount } from './list/contact-group-list-main-account';
import { ContactGroupListShared } from './list/contact-groups-list-shared';
import { FOLDERS } from '../../carbonio-ui-commons/constants/folders';
import { DISPLAYER_WIDTH } from '../../constants';

export const ContactGroupView = (): React.JSX.Element => {
	const { path } = useRouteMatch();
	const trimmedPath = useMemo(() => trimEnd(path, '/'), [path]);
	return (
		<Switch>
			<Route exact path={`${trimmedPath}/contact-groups/${FOLDERS.CONTACTS}/:id?`}>
				<Container
					width={'fill'}
					orientation="row"
					crossAlignment="flex-start"
					mainAlignment="flex-start"
					background="gray5"
					borderRadius="none"
				>
					<ContactGroupListMainAccount />
					<Container
						width={DISPLAYER_WIDTH}
						mainAlignment="flex-start"
						crossAlignment="flex-start"
						borderRadius="none"
						maxHeight={'100%'}
					>
						<ContactGroupDisplayerMainAccount />
					</Container>
				</Container>
			</Route>
			<Route exact path={`${trimmedPath}/contact-groups/:accountId/:id?`}>
				<Container
					width={'fill'}
					orientation="row"
					crossAlignment="flex-start"
					mainAlignment="flex-start"
					background="gray5"
					borderRadius="none"
				>
					<ContactGroupListShared />
					<Container
						width={DISPLAYER_WIDTH}
						mainAlignment="flex-start"
						crossAlignment="flex-start"
						borderRadius="none"
						maxHeight={'100%'}
					>
						<ContactGroupDisplayerShared />
					</Container>
				</Container>
			</Route>
		</Switch>
	);
};
