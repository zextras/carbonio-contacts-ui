/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

// FIXME decide a case convention and rename constants fields

export const TESTID_SELECTORS = {
	ICONS: {
		EDIT_DL: 'icon: Edit2Outline',
		EXPAND_DL: 'icon: ChevronDownOutline',
		FILTER_MEMBERS: 'icon: FunnelOutline',
		ADD_MEMBERS: 'icon: Plus',
		REMOVE_MEMBER: 'icon: Trash2Outline',
		DUPLICATED_MEMBER: 'icon: AlertCircle',
		CLOSE: 'icon: Close'
	} as const,
	AVATAR: 'avatar',
	MODAL: 'modal',
	CONTACT_INPUT: 'contact-input',
	CONTACT_INPUT_CHIP: 'default-chip',
	DROPDOWN_LIST: 'dropdown-popper-list',
	DL_MEMBERS_FILTER_INPUT: 'dl-members-filter-input',
	MEMBERS_LIST_ITEM: 'member-list-item',
	SNACKBAR: 'snackbar'
} as const;

export const PALETTE = {
	primary: {
		regular: '#2b73d2',
		hover: '#225ca8',
		active: '#1e5092',
		focus: '#225ca8',
		disabled: '#aac8ee'
	},
	secondary: {
		regular: '#828282',
		hover: '#696969',
		active: '#5c5c5c',
		focus: '#696969',
		disabled: '#cccccc'
	},
	gray0: {
		regular: '#414141',
		hover: '#282828',
		active: '#1b1b1b',
		focus: '#282828',
		disabled: '#cccccc'
	},
	gray1: {
		regular: '#828282',
		hover: '#696969',
		active: '#5c5c5c',
		focus: '#696969',
		disabled: '#cccccc'
	},
	gray2: {
		regular: '#cfd5dc',
		hover: '#b1bbc6',
		active: '#a3aebc',
		focus: '#b1bbc6',
		disabled: '#cfd5dc'
	},
	gray3: {
		regular: '#e6e9ed',
		hover: '#c8cfd8',
		active: '#bac2cd',
		focus: '#c8cfd8',
		disabled: '#e6e9ed'
	},
	gray4: {
		regular: '#eeeff3',
		hover: '#d0d3de',
		active: '#c1c5d3',
		focus: '#d0d3de',
		disabled: '#eeeff3'
	},
	gray5: {
		regular: '#f5f6f8',
		hover: '#d7dbe3',
		active: '#c8ced9',
		focus: '#d7dbe3',
		disabled: '#f5f6f8'
	},
	gray6: {
		regular: '#ffffff',
		hover: '#e6e6e6',
		active: '#d9d9d9',
		focus: '#e6e6e6',
		disabled: '#ffffff'
	},
	warning: {
		regular: '#ffc107',
		hover: '#d39e00',
		active: '#ba8b00',
		focus: '#d39e00',
		disabled: '#ffe699'
	},
	error: {
		regular: '#d74942',
		hover: '#be3028',
		active: '#a92a24',
		focus: '#be3028',
		disabled: '#edaeab'
	},
	success: {
		regular: '#8bc34a',
		hover: '#71a436',
		active: '#639030',
		focus: '#71a436',
		disabled: '#cee6b2'
	},
	info: {
		regular: '#2196d3',
		hover: '#1a75a7',
		active: '#176691',
		focus: '#1a75a7',
		disabled: '#a7d7f1'
	},
	text: {
		regular: '#333333',
		hover: '#1a1a1a',
		active: '#0d0d0d',
		focus: '#1a1a1a',
		disabled: '#cccccc'
	}
};

export const TIMERS = { MODAL: { DELAY_OPEN: 1 } as const } as const;

export const JEST_MOCKED_ERROR = 'jest mocked error';