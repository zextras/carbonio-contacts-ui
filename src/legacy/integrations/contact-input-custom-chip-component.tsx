/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

/* eslint-disable arrow-body-style */
import React, { ReactElement, useCallback, useEffect, useMemo, useState } from 'react';

import {
	Chip,
	Dropdown,
	Button,
	Container,
	DropdownItem,
	ChipAction
} from '@zextras/carbonio-design-system';
import { soapFetch } from '@zextras/carbonio-shell-ui';
import { debounce, DebouncedFuncLeading, filter, first, map, noop, uniqBy } from 'lodash';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { useActionEditDL } from '../../actions/edit-dl';
import { getDistributionList } from '../../api/get-distribution-list';
import { CHIP_DISPLAY_NAME_VALUES } from '../../constants/contact-input';
import { DistributionList } from '../../model/distribution-list';
import { ContactInputOnChange, ContactInputValue, CustomChipProps } from '../types/integrations';

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

const isDistributionList = ({ isGroup, email }: { isGroup?: boolean; email?: string }): boolean => {
	return (isGroup && !!email) ?? false;
};

const debounceUserInput = (
	fn: (...args: Array<unknown>) => unknown
): DebouncedFuncLeading<(...args: Array<unknown>) => unknown> =>
	debounce(fn, 500, {
		trailing: false,
		leading: true
	});

const getDistributionListMembers = async ({
	email,
	limit = 100,
	offset = 0
}: {
	email: string;
	limit?: number;
	offset?: number;
}): Promise<{ dlm: Array<{ _content: string }>; total: number; more: boolean; offset: number }> => {
	const result: { dlm: Array<{ _content: string }>; total: number; more: boolean } =
		await soapFetch('GetDistributionListMembers', {
			_jsns: 'urn:zimbraAccount',
			dl: {
				_content: email
			},
			limit,
			offset
		});
	return {
		...result,
		offset
	};
};

const getAllDistributionListMembers = async (
	email: string,
	members: Array<{ _content: string }> = [],
	offset = 0
): Promise<{ total: number; dlm: Array<{ _content?: string }> }> => {
	const response = await getDistributionListMembers({ email, offset });
	if (response.dlm) {
		const newValue = members.concat(response.dlm);
		if (response.more) {
			return getAllDistributionListMembers(email, newValue, offset + response.dlm.length);
		}
		return { total: response.total, dlm: newValue };
	}
	return { total: 0, dlm: [] };
};

const useDistributionListFunctions = ({
	email,
	id,
	isGroup,
	open,
	setOpen,
	_onChange,
	contactInputValue
}: {
	email: string;
	id: string | undefined;
	isGroup?: boolean;
	galType?: string;
	exp?: boolean;
	open: boolean;
	setOpen: React.Dispatch<React.SetStateAction<boolean>>;
	_onChange: ContactInputOnChange;
	contactInputValue: ContactInputValue;
}): { items: Array<DropdownItem>; onChevronClick: () => void } => {
	const [loading, setLoading] = useState(false);
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

	const updateStates = useCallback((result) => {
		setMore((prevValue) => (prevValue !== result.more ? result.more : prevValue));
		setOffset((prevValue) => prevValue + result.dlm.length);
		setDlm((prevValue) => uniqBy([...prevValue, ...result.dlm], '_content'));
		setTotal((prevValue) => (prevValue !== result.total ? result.total : prevValue));
	}, []);

	const onSelectAllClick = useCallback(() => {
		const updateDefaults = (_items: Array<{ _content?: string | undefined }>): void => {
			const newValue = map(_items, (item) => ({
				label: item._content,
				value: item._content,
				id: item._content,
				email: item._content
			}));
			_onChange &&
				_onChange([...filter(contactInputValue, (value) => value.id !== id), ...newValue]);
		};
		if (more) {
			getAllDistributionListMembers(email, dlm, offset).then((result) => {
				updateDefaults(result.dlm);
			});
		} else {
			updateDefaults(dlm);
		}
	}, [contactInputValue, dlm, email, id, more, offset, _onChange]);

	const onShowMoreClick = useCallback(() => {
		getDistributionListMembers({ email, offset }).then((result) => {
			updateStates(result);
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

	const onChevronClick = useCallback(() => {
		setOpen((prevValue: boolean) => !prevValue);

		if (!open && isDistributionList({ isGroup, email }) && !dlm.length && !loading) {
			setLoading(true);
			getDistributionListMembers({ email }).then((result) => {
				updateStates(result);
			});
		}
	}, [dlm.length, email, isGroup, loading, open, setOpen, updateStates]);

	const items = useMemo(() => {
		if (more) {
			return [selectAllButton, ...members, moreButton];
		}
		return [selectAllButton, ...members];
	}, [members, more, moreButton, selectAllButton]);

	return { items, onChevronClick };
};

const CustomComponent = ({
	id,
	label,
	email,
	isGroup,
	_onChange,
	contactInputValue,
	...rest
}: CustomChipProps): React.JSX.Element => {
	const [t] = useTranslation();
	const [open, setOpen] = useState(false);

	const { items, onChevronClick } = useDistributionListFunctions({
		id,
		email,
		open,
		setOpen,
		isGroup,
		_onChange,
		contactInputValue
	});

	const actionEditDL = useActionEditDL();
	const [distributionList, setDistributionList] = useState<DistributionList>();

	const chipActions = useMemo((): ChipAction[] => {
		const actions: ChipAction[] = [];
		if (distributionList && actionEditDL.canExecute(distributionList)) {
			actions.push({
				id: `chip-action-${actionEditDL.id}`,
				label: actionEditDL.label,
				type: 'button',
				icon: actionEditDL.icon,
				onClick: () => actionEditDL.execute(distributionList)
			});
		}
		actions.push({
			id: 'action2',
			label: t('expand_distribution_list', 'Expand address list'),
			type: 'button',
			icon: open ? 'ChevronUpOutline' : 'ChevronDownOutline',
			onClick: debounceUserInput(onChevronClick)
		});
		return actions;
	}, [actionEditDL, distributionList, onChevronClick, open, t]);

	useEffect(() => {
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
	}, [email]);

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
			onOpen={(): void => setOpen(true)}
			onClose={(): void => setOpen(false)}
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
	actions,
	...rest
}: CustomChipProps): ReactElement => {
	const _label = useMemo(() => {
		if (label && chipDisplayName === CHIP_DISPLAY_NAME_VALUES.LABEL) {
			return label;
		}
		if (email && chipDisplayName === CHIP_DISPLAY_NAME_VALUES.EMAIL) {
			return email;
		}
		return label || email || '';
	}, [chipDisplayName, email, label]);

	// TODO
	const validActions = useMemo(() => {
		return actions?.filter((action) => action.isVisible({}));
	}, [actions]);

	if (!isDistributionList({ email, isGroup })) {
		return <Chip {...rest} label={_label} data-testid={'default-chip'} actions={actions} />;
	}
	return (
		<CustomComponent {...rest} label={_label} email={email} isGroup={isGroup} actions={actions} />
	);
};
