/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

/* eslint-disable arrow-body-style */
import React, { ReactElement, useCallback, useState } from 'react';

import {
	Chip,
	Dropdown,
	Button,
	Container,
	DropdownItem,
	ChipItem
} from '@zextras/carbonio-design-system';
import { soapFetch } from '@zextras/carbonio-shell-ui';
import { filter, map } from 'lodash';
import { useTranslation } from 'react-i18next';

import { Contact } from '../types/contact';
import { TFunction } from 'i18next';

const getDistributionListMembers = ({
	email,
	limit = 100,
	offset = 0
}: {
	email: string;
	limit?: number;
	offset?: number;
}): Promise<{ dlm: Array<{ _content: string }>; total: number; more: boolean }> =>
	soapFetch('GetDistributionListMembers', {
		_jsns: 'urn:zimbraAccount',
		dl: {
			_content: email
		},
		limit,
		offset
	});

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

const explodeTitle = (total: number, t: TFunction): string =>
	t('label.select_all_addresses', {
		count: total ?? 0,
		defaultValue: `Select address`,
		defaultValue_plural: `Select all {{count}} addresses`
	});

const explodeDistributionListMembers = (
	_items: Array<{ _content: string }>,
	setDefaults: React.Dispatch<React.SetStateAction<ChipItem<string | Contact>[]>>,
	id: string
): void => {
	const newValue = map(_items, (item) => ({
		label: item._content,
		value: item._content,
		id: item._content,
		email: item._content
	}));
	setDefaults((prevValue) => [...filter(prevValue, (value) => value.id !== id), ...newValue]);
};

const processDistributionListMembers = ({
	more,
	dlm,
	total,
	setDefaults,
	id,
	t
}: {
	more: boolean;
	dlm: Array<{ _content: string }>;
	total: number;
	t: TFunction;
	setDefaults: React.Dispatch<React.SetStateAction<ChipItem<string | Contact>[]>>;
	id: string;
}): Array<DropdownItem> => {
	const selectAllItemButton = {
		id: 'dl-select-all',
		label: explodeTitle(total, t),
		tooltipLabel: explodeTitle(total, t),
		keepOpen: false,
		customComponent: (
			<Container width="fill" mainAlignment="center" orientation="horizontal">
				<Button
					size="small"
					type="outlined"
					shape="regular"
					width="fill"
					label={explodeTitle(total, t)}
					onClick={(): void => explodeDistributionListMembers(dlm, setDefaults, id)}
				/>
			</Container>
		)
	};

	const members = map(dlm, (item) => ({
		id: item?._content,
		label: item?._content,
		keepOpen: true,
		icon: 'PersonOutline',
		itemIconSize: 'large'
	}));

	const moreButton = {
		id: 'dl-get-more',
		label: 'more',
		tooltipLabel: 'more',
		keepOpen: false,
		customComponent: (
			<Container width="fill" mainAlignment="center" orientation="horizontal">
				<Button
					size="small"
					type="outlined"
					shape="regular"
					width="fill"
					label={'more'}
					onClick={(): void =>
						getDistributionListMembers(email, newValue, offset + response.dlm.length)
					}
				/>
			</Container>
		)
	};
	return more ? [selectAllItemButton, ...members, moreButton] : [selectAllItemButton, ...members];
};
const pippo = () => {
	getDistributionListMembers().then((result: any) => {
		processDistributionListMembers();
	});
};
export const AddDistributionListChip = (
	props: React.PropsWithChildren<ChipItem<any>>,
	setDefaults: React.Dispatch<React.SetStateAction<ChipItem<string | Contact>[]>>
): ReactElement => {
	const [t] = useTranslation();
	// refs: waiting for 'chipinput-improve-generic-type' to be merged
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	const { id, label, email, galType, onClose } = props;
	const [items, setItems] = useState<Array<DropdownItem>>([]);

	const [open, setOpen] = useState(false);

	function isDistributionList(contact: { isGroup: boolean; galType: string }): boolean {
		return contact.isGroup && contact.galType === 'gal';
	}

	const onChevronClick = useCallback(() => {
		setOpen((prevValue) => !prevValue);

		if (!open && galType === 'gal') {
			getDistributionListMembers(email).then((result: any) => {
				setItems([]);
			});
		}
	}, [open, galType, email]);
	// refs: waiting for 'chipinput-improve-generic-type' to be merged
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	if (!isDistributionList(props)) {
		return <Chip {...props} />;
	}
	return (
		<>
			<Dropdown items={items} placement="bottom" onClose={(): void => setOpen(false)}>
				<div>
					<Chip
						id={id}
						label={label}
						background={'gray3'}
						color="text"
						data-testid={'distribution-list-chip'}
						hasAvatar
						shape="regular"
						closable
						actions={[
							{
								id: 'action1',
								label: 'Expand addresses list',
								type: 'button',
								icon: open ? 'ChevronUpOutline' : 'ChevronDownOutline',
								onClick: onChevronClick
							},
							{
								id: 'action2',
								type: 'button',
								icon: 'CloseOutline',
								// refs: waiting for 'chipinput-improve-generic-type' to be merged
								// eslint-disable-next-line @typescript-eslint/ban-ts-comment
								// @ts-ignore
								onClick: onClose
							}
						]}
					/>
				</div>
			</Dropdown>
		</>
	);
};
