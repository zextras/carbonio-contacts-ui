/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react';

import { Container, ListV2 } from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';

import { Navbar } from '../../../components/sidebar/item-list/navbar';
import { LIST_WIDTH } from '../../../constants';
import { EmptyListPanel } from '../../../legacy/views/app/folder-panel/empty-list-panel';

type ContactGroupListComponentProps = {
	onContactGroupClick: (contactGroupId: string) => void;
	onListBottom: () => void;
	displayItems: () => React.JSX.Element[];
};
export const ContactGroupListComponent = ({
	onListBottom,
	displayItems
}: ContactGroupListComponentProps): React.JSX.Element => {
	const [t] = useTranslation();

	const items = displayItems();
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
				{items ? (
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
