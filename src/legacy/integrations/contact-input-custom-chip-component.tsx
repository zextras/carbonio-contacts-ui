/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { ReactElement, useCallback, useMemo, useState } from 'react';

import {
	Chip,
	Dropdown,
	Button,
	Container,
	type ChipAction,
	type ChipInputProps
} from '@zextras/carbonio-design-system';
import { debounce, DebouncedFuncLeading, filter, map, reduce, some } from 'lodash';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { ACTION_IDS, DL_MEMBERS_LOAD_LIMIT } from '../../constants';
import { CHIP_DISPLAY_NAME_VALUES } from '../../constants/contact-input';
import { useGetDistributionList } from '../../hooks/use-get-distribution-list';
import { useGetDistributionListMembers } from '../../hooks/use-get-distribution-list-members';
import type { DistributionListMembersPage } from '../../model/distribution-list';
import type {
	ContactChipAction,
	ContactInputChipDisplayName,
	ContactInputDistributionList,
	ContactInputItem,
	ContactInputOnChange,
	ContactInputValue,
	MakeRequired
} from '../types/integrations';

type CustomChipProps = React.ComponentPropsWithoutRef<
	NonNullable<ChipInputProps['ChipComponent']>
> & {
	email?: string;
	isGroup?: boolean;
};

type DLCustomChipProps = CustomChipProps & {
	contactInputOnChange: ContactInputOnChange;
	contactInputValue: ContactInputValue;
};

type ContactInputCustomChipComponentProps = DLCustomChipProps & {
	chipDisplayName?: ContactInputChipDisplayName;
	contactActions?: Array<ContactChipAction>;
};

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

export const isChipItemDistributionList = (
	contact: Pick<ContactInputItem, 'email' | 'isGroup'>
): contact is ContactInputDistributionList => (contact.isGroup && !!contact.email) ?? false;

const debounceUserInput = <T extends (...args: unknown[]) => unknown>(
	fn: T
): DebouncedFuncLeading<T> =>
	debounce(fn, 500, {
		trailing: false,
		leading: true
	});

const DistributionListChip = ({
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

export const ContactInputCustomChipComponent = ({
	email,
	isGroup = false,
	label,
	chipDisplayName = CHIP_DISPLAY_NAME_VALUES.label,
	contactActions,
	actions,
	...rest
}: ContactInputCustomChipComponentProps): ReactElement => {
	const contact = useMemo(() => ({ email, isGroup }), [email, isGroup]);
	const { distributionList } = useGetDistributionList(
		{ email },
		{ skip: !isChipItemDistributionList(contact) }
	);
	const chipLabel = useMemo(() => {
		if (label && chipDisplayName === CHIP_DISPLAY_NAME_VALUES.label) {
			return label;
		}
		if (email && chipDisplayName === CHIP_DISPLAY_NAME_VALUES.email) {
			return email;
		}
		return label || email || '';
	}, [chipDisplayName, email, label]);

	const chipActions = useMemo(
		() =>
			reduce<ContactChipAction, Array<ChipAction>>(
				contactActions,
				(result, contactAction) => {
					if (some(result, (action) => contactAction.id === action.id)) {
						return result;
					}

					if (contactAction.isVisible(distributionList ?? contact)) {
						result.push({
							...contactAction,
							onClick: (): void => {
								contactAction.onClick(distributionList ?? contact);
							}
						});
					}

					return result;
				},
				[...(actions ?? [])]
			),
		[actions, contact, contactActions, distributionList]
	);

	if (!isChipItemDistributionList(contact)) {
		return <Chip {...rest} label={chipLabel} data-testid={'default-chip'} actions={chipActions} />;
	}

	return (
		<DistributionListChip
			{...rest}
			label={chipLabel}
			email={contact.email}
			isGroup={contact.isGroup}
			actions={chipActions}
		/>
	);
};
