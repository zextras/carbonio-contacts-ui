/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { ReactNode, useCallback, useMemo } from 'react';

import { ContactGroupDisplayerDetails } from 'views/contact-groups/displayer/contact-group-displayer-details';
import { Displayer } from 'components/displayer/displayer';
import { DisplayerActionIconButton } from 'components/displayer/displayer-action-icon-button';
import { DisplayerActionsHeader } from 'components/displayer/displayer-actions-header';
import { DisplayerContent } from 'components/displayer/displayer-content';
import { ContactGroup } from 'model/contact-group';
import { useContactGroupActions } from 'views/contact-groups/actions/use-contact-group-actions';
import { useRedirectToContactGroupFolder } from 'views/contact-groups/navigation';

export const ContactGroupDisplayer = ({
	contactGroup
}: {
	contactGroup: ContactGroup;
}): React.JSX.Element => {
	const redirectTo = useRedirectToContactGroupFolder();
	const actions = useContactGroupActions(contactGroup);

	const routeToContactGroups = useCallback((): void => {
		contactGroup && redirectTo(contactGroup);
	}, [contactGroup, redirectTo]);
	const actionButtons = useMemo<ReactNode[]>(
		() => actions.map((action) => <DisplayerActionIconButton action={action} key={action.id} />),
		[actions]
	);
	return (
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
	);
};
