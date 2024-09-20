/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { useCallback, useMemo } from 'react';

import { map } from 'lodash';

import { ContactGroupListComponent } from './contact-group-list-component';
import { ContactGroupListItemMainAccount } from './contact-group-list-item-main-account';
import { StyledListItem } from '../../../components/styled-components';
import { useFindContactGroups } from '../../../hooks/useFindContactGroups';

export const ContactGroupListMainAccount = (): React.JSX.Element => {
	const { contactGroups: mainAccountContactGroups, hasMore, findMore } = useFindContactGroups();

	const onListBottom = useCallback(() => (hasMore ? findMore : undefined), [hasMore, findMore]);

	const items = useMemo(
		() =>
			map(mainAccountContactGroups, (contactGroup) => (
				<StyledListItem key={contactGroup.id} data-testid={'shared-list-item'}>
					{(visible): React.JSX.Element => (
						<ContactGroupListItemMainAccount visible={visible} contactGroup={contactGroup} />
					)}
				</StyledListItem>
			)),
		[mainAccountContactGroups]
	);

	return <ContactGroupListComponent onListBottom={onListBottom}>{items}</ContactGroupListComponent>;
};
