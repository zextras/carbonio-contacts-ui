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
import {
	debounce,
	DebouncedFuncLeading,
	filter,
	first,
	map,
	noop,
	reduce,
	size,
	some,
	uniqBy
} from 'lodash';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import type { ContactChipAction } from './contact-input';
import { getDistributionList } from '../../api/get-distribution-list';
import {
	getDistributionListMembers,
	GetDistributionListMembersResponse
} from '../../api/get-distribution-list-members';
import { CHIP_DISPLAY_NAME_VALUES } from '../../constants/contact-input';
import type { DistributionList } from '../../model/distribution-list';
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
	members: Array<{ _content: string }> = [],
	offset = 0
): Promise<{ total: number; dlm: Array<{ _content?: string }> }> => {
	const response = await getDistributionListMembers(email, { limit: 100, offset });
	if (response.dlm) {
		const newValue = members.concat(response.dlm);
		if (response.more) {
			return getAllDistributionListMembers(email, newValue, offset + response.dlm.length);
		}
		return { total: response.total ?? 0, dlm: newValue };
	}
	return { total: 0, dlm: [] };
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
	const [dlm, setDlm] = useState<Array<{ _content: string }>>([]);
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

	const members = useMemo(
		() =>
			map(dlm, (item) => ({
				id: item?._content,
				label: item?._content,
				keepOpen: true,
				icon: 'PersonOutline',
				itemIconSize: 'large'
			})),
		[dlm]
	);

	const updateStates = useCallback(
		(result: GetDistributionListMembersResponse, reset?: boolean) => {
			setMore(result.more ?? false);
			setOffset((prevValue) => (reset ? size(result.dlm) : prevValue + size(result.dlm)));
			setDlm((prevValue) =>
				reset
					? result.dlm ?? []
					: uniqBy([...prevValue, ...(result.dlm ?? [])], (item) => item._content)
			);
			setTotal(result.total ?? 0);
		},
		[]
	);

	const onSelectAllClick = useCallback(() => {
		const updateDefaults = (_items: Array<{ _content?: string }>): void => {
			const newValue = map(_items, (item) => ({
				label: item._content,
				value: item._content,
				id: item._content,
				email: item._content
			}));

			contactInputOnChange?.([
				...filter(contactInputValue, (value) => value.id !== id),
				...newValue
			]);
		};
		if (more) {
			getAllDistributionListMembers(email, dlm, offset).then((result) => {
				updateDefaults(result.dlm);
			});
		} else {
			updateDefaults(dlm);
		}
	}, [contactInputValue, dlm, email, id, more, offset, contactInputOnChange]);

	const onShowMoreClick = useCallback(() => {
		getDistributionListMembers(email, { limit: 100, offset }).then((result) => {
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
			getDistributionListMembers(email, { limit: 100 })
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
			return [selectAllButton, ...members, moreButton];
		}
		return [selectAllButton, ...members];
	}, [members, more, moreButton, selectAllButton]);

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
	chipDisplayName = CHIP_DISPLAY_NAME_VALUES.LABEL,
	contactActions,
	actions,
	...rest
}: CustomChipProps): ReactElement => {
	const [distributionList, setDistributionList] = useState<DistributionList>();
	const _label = useMemo(() => {
		if (label && chipDisplayName === CHIP_DISPLAY_NAME_VALUES.LABEL) {
			return label;
		}
		if (email && chipDisplayName === CHIP_DISPLAY_NAME_VALUES.EMAIL) {
			return email;
		}
		return label || email || '';
	}, [chipDisplayName, email, label]);

	useEffect(() => {
		if (isChipItemDistributionList({ email, isGroup })) {
			getDistributionList(email)
				.then((response) => {
					const dlData = first(response.dl);
					if (dlData) {
						setDistributionList({
							email: dlData.name,
							displayName: dlData._attrs?.displayName,
							isOwner: dlData.isOwner ?? false
						});
					}
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
						onClick: () => {
							contactAction.onClick(distributionList || { email, isGroup });
						}
					});
				}

				return result;
			},
			actions ?? []
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
