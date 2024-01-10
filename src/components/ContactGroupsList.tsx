/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { useMemo } from 'react';

import {
	Container,
	Divider,
	getColor,
	ListItem,
	type ListItemProps,
	ListV2,
	pseudoClasses,
	Row
} from '@zextras/carbonio-design-system';
import { isEmpty, map } from 'lodash';
import { useTranslation } from 'react-i18next';
import styled, { css, type DefaultTheme, type SimpleInterpolation } from 'styled-components';

import { CGListItem } from './cg-list-item';
import { HoverBarContainer } from './StyledComponents';
import { Text } from './Text';
import { LIST_WIDTH } from '../constants';
import { useActiveItem } from '../hooks/useActiveItem';
import { ContactGroup } from '../model/contact-group';

export type ContactGroupsListProps = {
	contactGroups: Array<ContactGroup>;
	onListBottom?: () => void;
};

const StyledListItem = styled(ListItem).attrs<
	ListItemProps,
	{ backgroundColor?: string | keyof DefaultTheme['palette'] }
>(({ background, selectedBackground, activeBackground, active, selected }) => ({
	backgroundColor: (active && activeBackground) || (selected && selectedBackground) || background
}))`
	${({ backgroundColor, theme }): SimpleInterpolation =>
		backgroundColor && pseudoClasses(theme, backgroundColor, 'color')}
	transition: none;

	${({ backgroundColor, theme }): SimpleInterpolation =>
		backgroundColor &&
		css`
			${HoverBarContainer} {
				background: linear-gradient(to right, transparent, ${getColor(backgroundColor, theme)});
			}
			&:focus ${HoverBarContainer} {
				background: linear-gradient(
					to right,
					transparent,
					${getColor(`${backgroundColor}.focus`, theme)}
				);
			}

			&:hover ${HoverBarContainer} {
				background: linear-gradient(
					to right,
					transparent,
					${getColor(`${backgroundColor}.hover`, theme)}
				);
			}

			&:active ${HoverBarContainer} {
				background: linear-gradient(
					to right,
					transparent,
					${getColor(`${backgroundColor}.active`, theme)}
				);
			}
		`}
`;

export const ContactGroupsList = ({
	contactGroups,
	onListBottom
}: ContactGroupsListProps): React.JSX.Element => {
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
		>
			<Row
				minHeight={'3rem'}
				height="auto"
				background={'gray5'}
				mainAlignment={'space-between'}
				padding={{ left: 'large' }}
				wrap={'nowrap'}
				width={'fill'}
				maxWidth={'100%'}
				data-testid="list-header"
				flexShrink={0}
				flexGrow={1}
				gap="medium"
			></Row>
			<Divider color="gray3" />
			<Container minHeight={0} maxHeight={'100%'}>
				{!isEmpty(items) ? (
					<ListV2 data-testid="main-list" background={'gray6'} onListBottom={onListBottom}>
						{items}
					</ListV2>
				) : (
					<Text size={'small'} weight={'bold'} overflow={'break-word'} color={'secondary'} centered>
						{t('contact_group_list.emptyList', 'No contact groups have been created yet')}
					</Text>
				)}
			</Container>
		</Container>
	);
};
