/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useCallback, useMemo, useState } from 'react';

import {
	Button,
	Chip,
	type ChipAction,
	Container,
	Dropdown
} from '@zextras/carbonio-design-system';
import { debounce, DebouncedFuncLeading, filter, map } from 'lodash';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { DLCustomChipProps, MakeRequired } from './types';
import { ACTION_IDS, DL_MEMBERS_LOAD_LIMIT } from '../../constants';
import { useGetDistributionListMembers } from '../../hooks/use-get-distribution-list-members';
import type { DistributionListMembersPage } from '../../model/distribution-list';

const StyledChip = styled(Chip)`
	cursor: default;
	&:hover {
		background: ${({ theme }): string => theme.palette.gray3.regular};
	}
`;

const DISTRIBUTION_ITEM = {
	SELECT_ALL: 'dl-select-all',
	MORE_ITEM: 'dl-get-more'
};

const debounceUserInput = <T extends (...args: unknown[]) => unknown>(
	fn: T
): DebouncedFuncLeading<T> =>
	debounce(fn, 500, {
		trailing: false,
		leading: true
	});

export const DistributionListChip = ({
	id,
	label,
	email,
	contactInputOnChange,
	contactInputValue,
	actions: propActions,
	...rest
}: MakeRequired<DLCustomChipProps, 'email'>): React.JSX.Element => {
	const [t] = useTranslation();
	const [open, setOpen] = useState(false);

	const {
		members,
		more,
		total,
		findMore: loadMembers
	} = useGetDistributionListMembers(email, {
		limit: DL_MEMBERS_LOAD_LIMIT,
		skip: !open
	});

	const showMoreLabel = t('label.show_more', 'Show more');

	const selectAllItemLabel = t('label.select_all_addresses', {
		count: total,
		defaultValue_one: `Select address`,
		defaultValue_other: `Select all {{count}} addresses`
	});

	const memberDropdownItems = useMemo(
		() =>
			map(members, (item) => ({
				id: item,
				label: item,
				keepOpen: true,
				icon: 'PersonOutline',
				itemIconSize: 'large'
			})),
		[members]
	);

	const updateContactInputValue = useCallback(
		(newItems: DistributionListMembersPage['members']) => {
			const newValue = map(newItems, (item) => ({
				label: item,
				value: item,
				id: item,
				email: item
			}));

			contactInputOnChange?.([
				...filter(contactInputValue, (value) => value.id !== id),
				...newValue
			]);
		},
		[contactInputOnChange, contactInputValue, id]
	);

	const onSelectAllClick = useCallback(() => {
		if (members !== undefined && members.length > 0) {
			if (more) {
				loadMembers(0).then((response) => {
					if (response) {
						updateContactInputValue([...members, ...response.members]);
					}
				});
			} else {
				updateContactInputValue(members);
			}
		}
	}, [more, loadMembers, updateContactInputValue, members]);

	const selectAllButton = useMemo(
		() => ({
			id: DISTRIBUTION_ITEM.SELECT_ALL,
			label: selectAllItemLabel,
			tooltipLabel: selectAllItemLabel,
			keepOpen: false,
			customComponent: (
				<Container width="fill" mainAlignment="center" orientation="horizontal">
					<Button
						size="small"
						shape="regular"
						width="fill"
						label={selectAllItemLabel}
						onClick={debounceUserInput(onSelectAllClick)}
					/>
				</Container>
			)
		}),
		[onSelectAllClick, selectAllItemLabel]
	);

	const onShowMore = useMemo(() => debounceUserInput(() => loadMembers()), [loadMembers]);

	const moreButton = useMemo(
		() => ({
			id: DISTRIBUTION_ITEM.MORE_ITEM,
			label: showMoreLabel,
			tooltipLabel: showMoreLabel,
			keepOpen: true,
			customComponent: (
				<Container width="fill" mainAlignment="center" orientation="horizontal">
					<Button
						size="small"
						type="outlined"
						shape="regular"
						width="fill"
						label={showMoreLabel}
						onClick={onShowMore}
					/>
				</Container>
			)
		}),
		[onShowMore, showMoreLabel]
	);

	const items = useMemo(() => {
		if (more) {
			return [selectAllButton, ...memberDropdownItems, moreButton];
		}
		return [selectAllButton, ...memberDropdownItems];
	}, [memberDropdownItems, more, moreButton, selectAllButton]);

	const expandDLAction = useCallback(() => {
		setOpen(true);
	}, []);

	const collapseDLAction = useCallback(() => {
		setOpen(false);
	}, []);

	const chipActions = useMemo((): ChipAction[] => {
		const actions: ChipAction[] = [...(propActions ?? [])];
		actions.push({
			id: ACTION_IDS.expandDL,
			label: t('expand_distribution_list', 'Expand address list'),
			type: 'button',
			icon: open ? 'ChevronUpOutline' : 'ChevronDownOutline',
			onClick: open ? collapseDLAction : expandDLAction
		});
		return actions;
	}, [collapseDLAction, expandDLAction, open, propActions, t]);

	const onChipClick = useCallback<React.MouseEventHandler>((e) => {
		e.stopPropagation();
	}, []);

	return (
		<Dropdown
			items={items}
			placement="bottom"
			forceOpen={open}
			disableAutoFocus
			width={'18.75rem'}
			onClose={collapseDLAction}
		>
			<div>
				<StyledChip
					{...rest}
					id={id}
					label={label}
					background={'gray3'}
					color="text"
					data-testid={'distribution-list-chip'}
					hasAvatar
					shape="regular"
					closable
					onClick={onChipClick}
					actions={chipActions}
				/>
			</div>
		</Dropdown>
	);
};
