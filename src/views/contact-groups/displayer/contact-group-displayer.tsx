/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useCallback } from 'react';

import { useParams } from 'react-router-dom';

import { ContactGroupDisplayerComponent } from './contact-group-displayer-component';
import { useAppSelector } from '../../../legacy/hooks/redux';
import { selectContactGroup } from '../../../legacy/store/selectors/contacts';
import { useContactGroupActions } from '../actions/use-contact-group-actions';
import { useRedirectToContactGroupFolder } from '../navigation';

export const ContactGroupDisplayer = (): React.JSX.Element => {
	const { id: contactGroupId, folderId } = useParams<{ folderId: string; id: string }>();
	const contactGroup = useAppSelector((state) =>
		selectContactGroup(state, folderId, contactGroupId)
	);
	const redirectTo = useRedirectToContactGroupFolder();
	const evaluateActions = useContactGroupActions();

	const routeToContactGroups = useCallback((): void => {
		contactGroup && redirectTo(contactGroup.folderId);
	}, [contactGroup, redirectTo]);

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
