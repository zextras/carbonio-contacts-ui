/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { ReactNode, useCallback, useMemo } from 'react';

import { useParams } from 'react-router-dom';

import { ContactGroupDisplayerDetails } from './contact-group-displayer-details';
import { ActionIconButton } from '../../../components/action-icon-button';
import { Displayer } from '../../../components/displayer/displayer';
import { DisplayerContent } from '../../../components/displayer/displayer-content';
import { DisplayerActionsHeader } from '../../../components/displayer-actions-header';
import { useAppSelector } from '../../../legacy/hooks/redux';
import { selectContactGroup } from '../../../legacy/store/selectors/contacts';
import ContactsEmptyDisplayer from '../../../legacy/views/app/contacts-empty-displayer';
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
		contactGroup && redirectTo(contactGroup);
	}, [contactGroup, redirectTo]);

	const actionsEvaluator = useCallback(() => {
		if (contactGroup) {
			return evaluateActions(contactGroup);
		}
		return [];
	}, [contactGroup, evaluateActions]);
	const actions = actionsEvaluator();
	const actionButtons = useMemo<ReactNode[]>(
		() => actions.map((action) => <ActionIconButton action={action} key={action.id} />),
		[actions]
	);
	return (
		<>
			{contactGroup ? (
				<Displayer
					data-testid="contact-group-displayer"
					title={contactGroup.title}
					icon={'PeopleOutline'}
					onClose={routeToContactGroups}
				>
					<DisplayerActionsHeader data-testid={'contact-group-displayer-actions'}>
						{actionButtons}
					</DisplayerActionsHeader>
					<DisplayerContent>
						<ContactGroupDisplayerDetails contactGroup={contactGroup} />
					</DisplayerContent>
				</Displayer>
			) : (
				<ContactsEmptyDisplayer />
			)}
		</>
	);
};
