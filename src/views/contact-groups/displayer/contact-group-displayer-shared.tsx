/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useCallback } from 'react';

import { useReplaceHistoryCallback } from '@zextras/carbonio-shell-ui';

import { ContactGroupDisplayerWithActions } from './contact-group-displayer-with-actions';
import { ContactGroupEmptyDisplayer } from './contact-group-empty-displayer';
import { ROUTES_INTERNAL_PARAMS } from '../../../constants';
import { useGetSharedAccountContactGroup } from '../../../hooks/useGetContactGroup';

interface ContactGroupSharedDisplayerProps {
	accountId: string;
	contactGroupId: string;
}

export const ContactGroupDisplayerShared = ({
	accountId,
	contactGroupId
}: ContactGroupSharedDisplayerProps): React.JSX.Element => {
	const contactGroup = useGetSharedAccountContactGroup(accountId, contactGroupId);
	const replaceHistory = useReplaceHistoryCallback();
	const closeDisplayer = useCallback((): void => {
		replaceHistory(`${ROUTES_INTERNAL_PARAMS.route.contactGroups}/${accountId}`);
	}, [accountId, replaceHistory]);

	return (
		<>
			{contactGroup ? (
				<ContactGroupDisplayerWithActions
					contactGroup={contactGroup}
					onCloseDisplayer={closeDisplayer}
				></ContactGroupDisplayerWithActions>
			) : (
				<ContactGroupEmptyDisplayer />
			)}
		</>
	);
};
