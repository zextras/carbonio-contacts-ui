/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

/* eslint-disable arrow-body-style */
import React, { ReactElement, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
	Chip,
	Dropdown,
	Button,
	Container,
	DropdownItem,
	ChipAction
} from '@zextras/carbonio-design-system';
import { debounce, DebouncedFuncLeading, filter, map, noop, reduce, some, uniq } from 'lodash';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import type { ContactChipAction } from './contact-input';
import { CHIP_DISPLAY_NAME_VALUES } from '../../constants/contact-input';
import type { DistributionList, DistributionListMembersPage } from '../../model/distribution-list';
import { client } from '../../network/client';
import type {
	ContactInputOnChange,
	ContactInputValue,
	CustomChipProps
} from '../types/integrations';

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

export const isChipItemDistributionList = ({
	isGroup,
	email
}: {
	isGroup?: boolean;
	email?: string;
}): boolean => {
	return (isGroup && !!email) ?? false;
};

const debounceUserInput = (
	fn: (...args: Array<unknown>) => unknown
): DebouncedFuncLeading<(...args: Array<unknown>) => unknown> =>
	debounce(fn, 500, {
		trailing: false,
		leading: true
	});

const getAllDistributionListMembers = async (
	email: string,
	members: DistributionListMembersPage['members'] = [],
	offset = 0
): Promise<Pick<DistributionListMembersPage, 'total' | 'members'>> => {
	const response = await client.getDistributionListMembers(email, { limit: 100, offset });
	const newValue = members.concat(response.members);
	if (response.more) {
		return getAllDistributionListMembers(email, newValue, offset + response.members.length);
	}
	return { total: response.total, members: newValue };
};

const useDistributionListFunctions = ({
	email,
	id,
	isGroup,
	contactInputOnChange,
	contactInputValue
}: {
	email: string;
	id: string | undefined;
	isGroup?: boolean;
	galType?: string;
	exp?: boolean;
	contactInputOnChange: ContactInputOnChange;
	contactInputValue: ContactInputValue;
}): { items: Array<DropdownItem>; loadMembers: () => void } => {
	const loadingRef = useRef(false);
	const [members, setMembers] = useState<DistributionListMembersPage['members']>([]);
	const [offset, setOffset] = useState(0);
	const [more, setMore] = useState(false);
	const [total, setTotal] = useState(0);

	const [t] = useTranslation();

	const showMoreLabel = t('label.show_more', 'show more');

	const selectAllItemLabel = t('label.select_all_addresses', {
		count: total ?? 0,
		defaultValue: `Select address`,
		defaultValue_plural: `Select all {{count}} addresses`
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

	const updateStates = useCallback((result: DistributionListMembersPage, reset?: boolean) => {
		setMore(result.more);
		setOffset((prevValue) => (reset ? result.members.length : prevValue + result.members.length));
		setMembers((prevValue) => (reset ? result.members : uniq([...prevValue, ...result.members])));
		setTotal(result.total ?? 0);
	}, []);

	const onSelectAllClick = useCallback(() => {
		const updateDefaults = (itemsToSet: DistributionListMembersPage['members']): void => {
			const newValue = map(itemsToSet, (item) => ({
				label: item,
				value: item,
				id: item,
				email: item
			}));

			contactInputOnChange?.([
				...filter(contactInputValue, (value) => value.id !== id),
				...newValue
			]);
		};
		if (more) {
			getAllDistributionListMembers(email, members, offset).then((result) => {
				updateDefaults(result.members);
			});
		} else {
			updateDefaults(members);
		}
	}, [contactInputValue, members, email, id, more, offset, contactInputOnChange]);

	const onShowMoreClick = useCallback(() => {
		client.getDistributionListMembers(email, { limit: 100, offset }).then((result) => {
			updateStates(result, false);
		});
	}, [email, offset, updateStates]);

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
						onClick={total > 0 ? debounceUserInput(onSelectAllClick) : noop}
					/>
				</Container>
			)
		}),
		[onSelectAllClick, selectAllItemLabel, total]
	);

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
						onClick={debounceUserInput(onShowMoreClick)}
					/>
				</Container>
			)
		}),
		[onShowMoreClick, showMoreLabel]
	);

	const loadMembers = useCallback(() => {
		if (isChipItemDistributionList({ isGroup, email }) && !loadingRef.current) {
			loadingRef.current = true;
			client
				.getDistributionListMembers(email, { limit: 100 })
				.then((result) => {
					loadingRef.current = false;
					updateStates(result, true);
				})
				.catch((error) => {
					console.error(error);
				});
		}
	}, [email, isGroup, updateStates]);

	const items = useMemo(() => {
		if (more) {
			return [selectAllButton, ...memberDropdownItems, moreButton];
		}
		return [selectAllButton, ...memberDropdownItems];
	}, [memberDropdownItems, more, moreButton, selectAllButton]);

	return { items, loadMembers };
};

const CustomComponent = ({
	id,
	label,
	email,
	isGroup,
	contactInputOnChange,
	contactInputValue,
	actions: propActions,
	...rest
}: CustomChipProps): React.JSX.Element => {
	const [t] = useTranslation();
	const [open, setOpen] = useState(false);

	const { items, loadMembers } = useDistributionListFunctions({
		id,
		email,
		isGroup,
		contactInputOnChange,
		contactInputValue
	});

	const expandDLAction = useCallback(() => {
		setOpen(true);
		loadMembers();
	}, [loadMembers]);

	const collapseDLAction = useCallback(() => {
		setOpen(false);
	}, []);

	const chipActions = useMemo((): ChipAction[] => {
		const actions: ChipAction[] = [...(propActions ?? [])];
		actions.push({
			id: 'action2',
			label: t('expand_distribution_list', 'Expand address list'),
			type: 'button',
			icon: open ? 'ChevronUpOutline' : 'ChevronDownOutline',
			onClick: open ? collapseDLAction : debounceUserInput(expandDLAction)
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

export const ContactInputCustomChipComponent = ({
	email,
	isGroup,
	label,
	chipDisplayName = CHIP_DISPLAY_NAME_VALUES.label,
	contactActions,
	actions,
	...rest
}: CustomChipProps): ReactElement => {
	const [distributionList, setDistributionList] = useState<DistributionList>();
	const _label = useMemo(() => {
		if (label && chipDisplayName === CHIP_DISPLAY_NAME_VALUES.label) {
			return label;
		}
		if (email && chipDisplayName === CHIP_DISPLAY_NAME_VALUES.email) {
			return email;
		}
		return label || email || '';
	}, [chipDisplayName, email, label]);

	useEffect(() => {
		if (isChipItemDistributionList({ email, isGroup })) {
			client
				.getDistributionList({ email })
				.then((response) => {
					setDistributionList(response);
				})
				.catch((error) => {
					setDistributionList(undefined);
					console.error(error);
				});
		}
	}, [email, isGroup]);

	const chipActions = useMemo(() => {
		return reduce<ContactChipAction, Array<ChipAction>>(
			contactActions,
			(result, contactAction) => {
				if (some(result, (action) => contactAction.id === action.id)) {
					return result;
				}

				if (contactAction.isVisible(distributionList || { email, isGroup })) {
					result.push({
						...contactAction,
						onClick: (): void => {
							contactAction.onClick(distributionList || { email, isGroup });
						}
					});
				}

				return result;
			},
			[...(actions ?? [])]
		);
	}, [actions, contactActions, distributionList, email, isGroup]);

	if (!isChipItemDistributionList({ email, isGroup })) {
		return <Chip {...rest} label={_label} data-testid={'default-chip'} actions={chipActions} />;
	}

	return (
		<CustomComponent
			{...rest}
			label={_label}
			email={email}
			isGroup={isGroup}
			actions={chipActions}
		/>
	);
};
