/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useCallback, useMemo } from 'react';

import { List } from '@zextras/carbonio-design-system';
import { map } from 'lodash';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

import { ContactGroupListItemWrapper } from './contact-group-list-item-wrapper';
import { EnhancedListItem } from '../../../components/styled-components';
import { useFindContactGroups } from '../../../hooks/useFindContactGroups';
import { EmptyListPanel } from '../../../legacy/views/app/folder-panel/empty-list-panel';

export const ContactGroupList = (): React.JSX.Element => {
	const { id: currentPathId, folderId } = useParams<{ id: string; folderId: string }>();
	const [t] = useTranslation();
	const {
		contactGroups: mainAccountContactGroups,
		hasMore,
		findMore
	} = useFindContactGroups(folderId);
	const onListBottom = useCallback(() => (hasMore ? findMore() : undefined), [hasMore, findMore]);

	const items = useMemo(
		() =>
			map(mainAccountContactGroups, (contactGroup) => (
				<EnhancedListItem
					key={contactGroup.id}
					data-testid={`main-account-list-item-${contactGroup.id}`}
					active={currentPathId === contactGroup.id}
				>
					{(): React.JSX.Element => <ContactGroupListItemWrapper contactGroup={contactGroup} />}
				</EnhancedListItem>
			)),
		[currentPathId, mainAccountContactGroups]
	);

	return (
		<>
			{items.length === 0 ? (
				<EmptyListPanel
					emptyListTitle={t(
						'contactGroupList.emptyList',
						'No contact groups have been created yet'
					)}
				/>
			) : (
				<List
					data-testid="main-list"
					background={'gray6'}
					onListBottom={onListBottom}
					intersectionObserverInitOptions={{ threshold: 0.5 }}
				>
					{items}
				</List>
			)}
		</>
	);
};
