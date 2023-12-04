/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
export const TESTID_SELECTORS = {
	ICONS: {
		EDIT_DL: 'icon: Edit2Outline',
		EXPAND_DL: 'icon: ChevronDownOutline',
		SEARCH_MEMBERS: 'icon: Search',
		ADD_MEMBERS: 'icon: Plus',
		REMOVE_MEMBER: 'icon: Trash2Outline'
	} as const,
	AVATAR: 'avatar',
	MODAL: 'modal',
	CONTACT_INPUT: 'contact-input',
	DL_MEMBERS_SEARCH_INPUT: 'dl-members-search-input'
} as const;

export const TIMERS = { MODAL: { DELAY_OPEN: 1 } as const } as const;
