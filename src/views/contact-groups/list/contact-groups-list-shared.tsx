/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useMemo } from 'react';

import { map, noop } from 'lodash';
import { useParams } from 'react-router-dom';

import { ContactGroupListComponent } from './contact-group-list-component';
import { ContactGroupListItemSharedAccount } from './contact-group-list-item-shared-account';
import { StyledListItem } from '../../../components/styled-components';
import { useFindSharedContactGroups } from '../../../hooks/use-find-shared-contact-groups';

export const ContactGroupListShared = (): React.JSX.Element => {
	const { accountId } = useParams<{ accountId: string }>();
	const { sharedContactGroups } = useFindSharedContactGroups(accountId);

	const items = useMemo(
		() =>
			map(sharedContactGroups, (contactGroup) => (
				<StyledListItem key={contactGroup.id} data-testid={'shared-list-item'}>
					{(visible): React.JSX.Element => (
						<ContactGroupListItemSharedAccount visible={visible} contactGroup={contactGroup} />
					)}
				</StyledListItem>
			)),
		[sharedContactGroups]
	);

	return <ContactGroupListComponent onListBottom={noop}>{items}</ContactGroupListComponent>;
};
