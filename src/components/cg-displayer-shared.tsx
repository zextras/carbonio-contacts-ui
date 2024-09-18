/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useCallback } from 'react';

import { useReplaceHistoryCallback } from '@zextras/carbonio-shell-ui';

import { CGDisplayerComponent } from './cg-displayer-component';
import { ROUTES_INTERNAL_PARAMS } from '../constants';
import { useActiveContactGroup } from '../hooks/useActiveContactGroup';

interface ContactGroupSharedDisplayerProps {
	accountId: string;
}

export const CGDisplayerShared = ({
	accountId
}: ContactGroupSharedDisplayerProps): React.JSX.Element => {
	// TODO: consider making a different hook, e.g.: useActiveSharedContactGroup
	const contactGroup = useActiveContactGroup();
	const replaceHistory = useReplaceHistoryCallback();
	const closeDisplayer = useCallback((): void => {
		replaceHistory(`${ROUTES_INTERNAL_PARAMS.route.contactGroups}/${accountId}`);
	}, [accountId, replaceHistory]);

	return (
		<CGDisplayerComponent
			onCloseDisplayer={closeDisplayer}
			contactGroup={contactGroup}
		></CGDisplayerComponent>
	);
};
