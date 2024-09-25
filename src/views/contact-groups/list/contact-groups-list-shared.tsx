/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useMemo } from 'react';

import { map } from 'lodash';
import { useParams } from 'react-router-dom';

import { ContactGroupListComponent } from './contact-group-list-component';
import { ContactGroupListItemSharedAccount } from './contact-group-list-item-shared-account';
import { StyledListItem } from '../../../components/styled-components';
import { useFindSharedContactGroups } from '../../../hooks/use-find-shared-contact-groups';

export const ContactGroupListShared = (): React.JSX.Element => {
	const { accountId, id: currentPathId } = useParams<{ accountId: string; id: string }>();
	const { sharedContactGroups, findMore } = useFindSharedContactGroups(accountId);

	const items = useMemo(
		() =>
			map(sharedContactGroups, (contactGroup) => (
				<StyledListItem
					key={contactGroup.id}
					data-testid={`shared-list-item-${contactGroup.id}`}
					active={currentPathId === contactGroup.id}
				>
					{(visible): React.JSX.Element => (
						<ContactGroupListItemSharedAccount visible={visible} contactGroup={contactGroup} />
					)}
				</StyledListItem>
			)),
		[currentPathId, sharedContactGroups]
	);

	return <ContactGroupListComponent onListBottom={findMore}>{items}</ContactGroupListComponent>;
};
