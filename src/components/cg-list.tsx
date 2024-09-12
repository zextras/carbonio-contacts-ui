/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { useMemo } from 'react';

import { map } from 'lodash';
import { useTranslation } from 'react-i18next';

import { CGListItem } from './cg-list-item';
import { MainList } from './main-list';
import { StyledListItem } from './styled-components';
import { useActiveItem } from '../hooks/useActiveItem';
import { ContactGroup } from '../model/contact-group';
import {LIST_WIDTH} from "../constants";
import {Container, Divider, ListV2, Row} from "@zextras/carbonio-design-system";
import {Text} from "./Text";
import {Navbar} from "./sidebar/item-list/navbar";

export type CGListProps = {
	contactGroups: Array<ContactGroup>;
	onListBottom?: () => void;
};

export const CGList = ({ contactGroups, onListBottom }: CGListProps): React.JSX.Element => {
	const [t] = useTranslation();
	const { activeItem, setActive } = useActiveItem();

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
							onClick={setActive}
							members={contactGroup.members}
						/>
					)}
				</StyledListItem>
			)),
		[activeItem, contactGroups, setActive]
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
				<Navbar name={`/ ${t('secondaryBar.contactGroups', 'Contact Groups')}`} itemsCount={items.length}/>
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
							<Text size={'small'} weight={'regular'} overflow={'break-word'} color={'secondary'} centered>
								{t('contactGroupList.emptyList', 'No contact groups have been created yet')}
							</Text>
					)}
				</Container>
			</Container>
	);
};
