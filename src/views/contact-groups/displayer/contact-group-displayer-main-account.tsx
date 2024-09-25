/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useCallback } from 'react';

import { useReplaceHistoryCallback } from '@zextras/carbonio-shell-ui';
import { useParams } from 'react-router-dom';

import { ContactGroupDisplayerComponent } from './contact-group-displayer-component';
import { FOLDERS } from '../../../carbonio-ui-commons/constants/folders';
import { ROUTES_INTERNAL_PARAMS } from '../../../constants';
import { useEvaluateMainAccountContactGroupActions } from '../../../hooks/use-contact-group-actions';
import { useGetMainAccountContactGroup } from '../../../hooks/useGetContactGroup';

export const ContactGroupDisplayerMainAccount = (): React.JSX.Element => {
	const { id: contactGroupId } = useParams<{ id: string }>();
	const contactGroup = useGetMainAccountContactGroup(contactGroupId);
	const replaceHistory = useReplaceHistoryCallback();
	const routeToContacts = useCallback((): void => {
		replaceHistory(`${ROUTES_INTERNAL_PARAMS.route.contactGroups}/${FOLDERS.CONTACTS}`);
	}, [replaceHistory]);
	const evaluateActions = useEvaluateMainAccountContactGroupActions();
	const actionsEvaluator = useCallback(() => {
		if (contactGroup) {
			return evaluateActions(contactGroup);
		}
		return [];
	}, [contactGroup, evaluateActions]);

	return (
		<>
			<ContactGroupDisplayerComponent
				contactGroup={contactGroup}
				onCloseDisplayer={routeToContacts}
				actionEvaluator={actionsEvaluator}
			/>
		</>
	);
};
