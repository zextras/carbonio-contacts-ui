/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useCallback, useMemo } from 'react';

import { List } from '@zextras/carbonio-design-system';
import { map } from 'lodash';
import { useParams } from 'react-router-dom';

import { EnhancedListItem } from '../../../../components/styled-components';
import { useFindContactGroups } from '../../../../hooks/useFindContactGroups';
import { ContactGroupListItemMainAccount } from '../../../../views/contact-groups/list/contact-group-list-item-main-account';

export const ContactGroupList = (): React.JSX.Element => {
	const { contactGroups: mainAccountContactGroups, hasMore, findMore } = useFindContactGroups();
	const onListBottom = useCallback(() => (hasMore ? findMore() : undefined), [hasMore, findMore]);
	const { id: currentPathId } = useParams<{ id: string }>();

	const items = useMemo(
		() =>
			map(mainAccountContactGroups, (contactGroup) => (
				<EnhancedListItem
					key={contactGroup.id}
					data-testid={`main-account-list-item-${contactGroup.id}`}
					active={currentPathId === contactGroup.id}
				>
					{(visible): React.JSX.Element => (
						<ContactGroupListItemMainAccount visible={visible} contactGroup={contactGroup} />
					)}
				</EnhancedListItem>
			)),
		[currentPathId, mainAccountContactGroups]
	);

	return (
		<List
			data-testid="main-list"
			background={'gray6'}
			onListBottom={onListBottom}
			intersectionObserverInitOptions={{ threshold: 0.5 }}
		>
			{items}
		</List>
	);
};
