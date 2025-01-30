/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { ContactGroupListItem } from './contact-group-list-item';
import { ContactGroup } from '../../../model/contact-group';
import { useContactGroupActions } from '../actions/use-contact-group-actions';
import { useRedirectToContactGroup } from '../navigation';

type ContactGroupListItemWrapperProps = {
	contactGroup: ContactGroup;
};

export const ContactGroupListItemWrapper = ({
	contactGroup
}: ContactGroupListItemWrapperProps): React.JSX.Element => {
	const actions = useContactGroupActions()(contactGroup);
	const redirectTo = useRedirectToContactGroup();
	return (
		<ContactGroupListItem
			contactGroup={contactGroup}
			onClick={(): void => redirectTo(contactGroup)}
			actions={actions}
		/>
	);
};
