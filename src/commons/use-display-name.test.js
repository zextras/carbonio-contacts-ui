/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
// import { renderHook } from '@testing-library/react-hooks';

import { useDisplayName } from './use-display-name';

const contacts = {
	empty: {
		firstName: '',
		middleName: '',
		lastName: '',
		email: [],
		nameSuffix: '',
		namePrefix: ''
	},
	example: {
		firstName: 'Parker',
		middleName: 'Averill',
		lastName: 'Swindlehurst',
		email: [
			{
				mail: 'swindlehurst@gmail.com'
			}
		],
		nameSuffix: 'Junior',
		namePrefix: 'Sir'
	},
	mailOnly: {
		email: [
			{
				mail: 'swindlehurst@gmail.com'
			}
		]
	},
	undefined: {},
	partial: {
		firstName: 'Parker'
	},
	partial2: {
		lastName: 'Swindlehurst'
	}
};

describe('useDisplayName', () => {
	test('useDisplayName', () => {
		// const { result, rerender } = renderHook(({ contact }) => useDisplayName(contact), {
		// 	initialProps: { contact: contacts.example }
		// });
		// expect(result.current).toBe('Sir Parker Averill Swindlehurst Junior');
		// rerender({ contact: contacts.mailOnly });
		// expect(result.current).toBe('<No Name> swindlehurst@gmail.com');
		// rerender({ contact: contacts.empty });
		// expect(result.current).toBe('<No Data>');
		// rerender({});
		// expect(result.current).toBe('<No Data>');
		// rerender({ contact: contacts.empty });
		// expect(result.current).toBe('<No Data>');
		// rerender({ contact: contacts.partial });
		// expect(result.current).toBe('Parker');
		// rerender({ contact: contacts.partial2 });
		// expect(result.current).toBe('Swindlehurst');
	});
});
