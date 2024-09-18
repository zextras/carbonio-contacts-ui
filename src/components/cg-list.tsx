/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { useCallback, useMemo } from 'react';

import { Container, ListV2 } from '@zextras/carbonio-design-system';
import { useReplaceHistoryCallback } from '@zextras/carbonio-shell-ui';
import { map } from 'lodash';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

import { CGListItem } from './cg-list-item';
import { Navbar } from './sidebar/item-list/navbar';
import { StyledListItem } from './styled-components';
import { LIST_WIDTH } from '../constants';
import { useFindSharedContactGroups } from '../hooks/use-find-shared-contact-groups';
import { useActiveItem } from '../hooks/useActiveItem';
import { useFindContactGroups } from '../hooks/useFindContactGroups';
import { EmptyListPanel } from '../legacy/views/app/folder-panel/empty-list-panel';

export const CGList = (): React.JSX.Element => {
	const { accountId } = useParams<{ accountId: string }>();
	const [t] = useTranslation();
	const { activeItem } = useActiveItem();
	const { contactGroups: mainAccountContactGroups, hasMore, findMore } = useFindContactGroups();

	const replaceHistory = useReplaceHistoryCallback();
	const { sharedContactGroups } = useFindSharedContactGroups(accountId);
	const contactGroups = accountId ? sharedContactGroups : mainAccountContactGroups;
	const onListBottom = useCallback(() => (hasMore ? findMore : undefined), [hasMore, findMore]);

	const onClick = useCallback(
		(id: string) => {
			replaceHistory(`/contact-groups/${id}`);
		},
		[replaceHistory]
	);

	const items = useMemo(
		() =>
			map(contactGroups, (contactGroup) => (
				<StyledListItem
					key={contactGroup.id}
					active={contactGroup.id === activeItem}
					data-testid={'list-item'}
				>
					{(visible): React.JSX.Element => (
						<CGListItem
							visible={visible}
							title={contactGroup.title}
							id={contactGroup.id}
							onClick={onClick}
							members={contactGroup.members}
						/>
					)}
				</StyledListItem>
			)),
		[activeItem, contactGroups, onClick]
	);

	return (
		<Container
			width={LIST_WIDTH}
			mainAlignment="flex-start"
			crossAlignment="unset"
			borderRadius="none"
			background={'gray6'}
			borderColor={{ right: 'gray3' }}
		>
			<Navbar
				name={`/ ${t('secondaryBar.contactGroups', 'Contact Groups')}`}
				itemsCount={items.length}
			/>
			<Container minHeight={0} maxHeight={'100%'}>
				{items && items.length > 0 ? (
					<ListV2
						data-testid="main-list"
						background={'gray6'}
						onListBottom={onListBottom}
						intersectionObserverInitOptions={{ threshold: 0.5 }}
					>
						{items}
					</ListV2>
				) : (
					<EmptyListPanel
						emptyListTitle={t(
							'contactGroupList.emptyList',
							'No contact groups have been created yet'
						)}
					/>
				)}
			</Container>
		</Container>
	);
};
