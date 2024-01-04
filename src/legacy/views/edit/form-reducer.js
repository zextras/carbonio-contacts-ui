/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
export const op = {
	setEmptyContact: 'newContact',
	setExistingContact: 'existingContact',
	setInput: 'setInput',
	setRowInput: 'addField',
	setSelect: 'setSelect'
};

export default function reducer(state, action) {
	switch (action.type) {
		case op.setEmptyContact:
			return {
				parent: '7',
				address: {},
				email: {},
				phone: {},
				URL: {},
				jobTitle: '',
				department: '',
				namePrefix: '',
				company: '',
				firstName: '',
				middleName: '',
				nickName: '',
				lastName: '',
				nameSuffix: '',
				image: '',
				notes: ''
			};
		case op.setExistingContact:
			return {
				...state,
				...action.payload.existingContact
			};
		case op.setSelect:
			if (action.payload.ev.name === 'address') {
				return {
					...state,
					[action.payload.ev.name]: {
						...state[action.payload.ev.name],
						[action.payload.id]: {
							...state[action.payload.ev.name][action.payload.id],
							[action.payload.subField]: action.payload.ev.value
						}
					}
				};
			}
			return {
				...state,
				[action.payload.ev.name]: {
					...state[action.payload.ev.name],
					[action.payload.id]: {
						[action.payload.subField]: action.payload.ev.value
					}
				}
			};
		case op.setRowInput:
			return {
				...state,
				[action.name]: action.payload
			};
		case op.setInput:
			return {
				...state,
				[action.payload.name]: action.payload.value
			};
		default:
			return state;
	}
}
