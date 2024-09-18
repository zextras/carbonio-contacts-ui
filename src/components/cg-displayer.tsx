/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useCallback } from 'react';

import { Container } from '@zextras/carbonio-design-system';
import { useReplaceHistoryCallback } from '@zextras/carbonio-shell-ui';

import { CGDisplayerDetails } from './cg-displayer-details';
import { DisplayerActionsHeader } from './displayer-actions-header';
import { DisplayerHeader } from './displayer-header';
import { ROUTES_INTERNAL_PARAMS } from '../constants';
import { useContactGroupActions } from '../hooks/use-contact-group-actions';
import { ContactGroup } from '../model/contact-group';

interface ContactGroupDisplayerProps {
	contactGroup: ContactGroup;
}

export const CGDisplayer = ({ contactGroup }: ContactGroupDisplayerProps): React.JSX.Element => {
	const actions = useContactGroupActions(contactGroup);
	const replaceHistory = useReplaceHistoryCallback();
	// FIXME: we cannot redirect to the same url for shared contact groups
	const closeDisplayer = useCallback((): void => {
		replaceHistory(`${ROUTES_INTERNAL_PARAMS.route.contactGroups}/7`);
	}, [replaceHistory]);

	return (
		<Container background={'gray5'} mainAlignment={'flex-start'} padding={{ bottom: '3rem' }}>
			<DisplayerHeader
				title={contactGroup.title}
				icon={'PeopleOutline'}
				closeDisplayer={closeDisplayer}
			/>
			<Container
				padding={{ horizontal: '1rem' }}
				mainAlignment={'flex-start'}
				minHeight={0}
				maxHeight={'100%'}
			>
				<DisplayerActionsHeader actions={actions} />
				<CGDisplayerDetails contactGroup={contactGroup} />
			</Container>
		</Container>
	);
};
