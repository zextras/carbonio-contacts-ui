/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useCallback } from 'react';

import { useReplaceHistoryCallback } from '@zextras/carbonio-shell-ui';
import { useParams } from 'react-router-dom';

import { ContactGroupDisplayerComponent } from './contact-group-displayer-component';
import { ROUTES_INTERNAL_PARAMS } from '../../../constants';
import { useEvaluateSharedContactGroupActions } from '../../../hooks/use-contact-group-actions';
import { useSharedContactGroup } from '../../../store/contact-groups';

export const ContactGroupDisplayerShared = (): React.JSX.Element => {
	const { id: contactGroupId, accountId } = useParams<{ id: string; accountId: string }>();
	const contactGroup = useSharedContactGroup(accountId, contactGroupId);
	const replaceHistory = useReplaceHistoryCallback();
	const routeToContactGroups = useCallback((): void => {
		replaceHistory(`${ROUTES_INTERNAL_PARAMS.route.contactGroups}/${accountId}`);
	}, [accountId, replaceHistory]);
	const evaluateActions = useEvaluateSharedContactGroupActions();
	const actionsEvaluator = useCallback(() => {
		if (contactGroup) {
			return evaluateActions(contactGroup);
		}
		return [];
	}, [contactGroup, evaluateActions]);

	return (
		<ContactGroupDisplayerComponent
			contactGroup={contactGroup}
			onCloseDisplayer={routeToContactGroups}
			actionEvaluator={actionsEvaluator}
		/>
	);
};
