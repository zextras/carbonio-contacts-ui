/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import {
	Tag,
	useRunSearchIntegration,
	useTagStore,
	ZIMBRA_STANDARD_COLORS
} from '@zextras/carbonio-ui-commons';
import { Mock } from 'vitest';

import { screen, setupTest } from '@test-setup';
import { ActionTagButton } from 'components/action-tag-button';
import { Contact } from 'legacy/types/contact';

vi.mock('@zextras/carbonio-ui-commons', async () => {
	const actual = await vi.importActual<typeof import('@zextras/carbonio-ui-commons')>(
		'@zextras/carbonio-ui-commons'
	);
	return {
		...actual,
		useRunSearchIntegration: vi.fn()
	};
});

const customTag: Tag = { id: '10', name: 'work', rgb: '#abcdef' };
const standardTag: Tag = { id: '11', name: 'home', color: 4 };

const buildContact = (tags: Array<string>): Contact => ({ id: '42', tags }) as unknown as Contact;

describe('ActionTagButton', () => {
	beforeEach(() => {
		useTagStore.setState({ tags: { [customTag.id]: customTag, [standardTag.id]: standardTag } });
	});

	it('searches the single tag with its custom color', async () => {
		const runSearch = vi.fn();
		(useRunSearchIntegration as Mock).mockReturnValue(runSearch);

		const { user } = setupTest(<ActionTagButton contact={buildContact(['10'])} />);
		await user.click(screen.getByTestId('TagIconButton'));

		expect(runSearch).toHaveBeenCalledWith(
			[expect.objectContaining({ avatarBackground: '#abcdef', label: 'tag:work' })],
			'contacts'
		);
	});

	it('colors each tag in the multi-tag dropdown with its own color', async () => {
		const { user } = setupTest(<ActionTagButton contact={buildContact(['10', '11'])} />);
		await user.click(screen.getByTestId('TagIconButton'));

		// tags are listed sorted by name: "home", then "work"
		const [homeIcon, workIcon] = await screen.findAllByTestId('icon: Tag');
		expect(homeIcon).toHaveStyleRule('color', ZIMBRA_STANDARD_COLORS[4].hex);
		expect(workIcon).toHaveStyleRule('color', '#abcdef');
	});
});
