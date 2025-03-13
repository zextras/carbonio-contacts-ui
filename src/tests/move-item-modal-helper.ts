/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { act } from '@testing-library/react';
import { UserEvent } from '@testing-library/user-event';

import { FOLDER_VIEW } from '../carbonio-ui-commons/constants';
import { FOLDERS } from '../carbonio-ui-commons/constants/folders';
import { generateFolder } from '../carbonio-ui-commons/test/mocks/folders/folders-generator';
import { populateFoldersStore } from '../carbonio-ui-commons/test/mocks/store/folders';
import { makeListItemsVisible, screen } from '../carbonio-ui-commons/test/test-setup';

export const setupMoveItemModal = (
	folder = generateFolder({
		parent: FOLDERS.USER_ROOT,
		name: 'anotherContactFolder',
		id: '500',
		absFolderPath: '/anotherContactFolder',
		view: FOLDER_VIEW.contact,
		children: []
	})
): {
	selectFolder: (user: UserEvent) => Promise<void>;
	confirm: (user: UserEvent) => Promise<void>;
} => {
	populateFoldersStore({
		customFolders: [folder]
	});
	return {
		selectFolder: (user: UserEvent): Promise<void> => {
			act(() => {
				jest.advanceTimersByTime(1000);
			});
			makeListItemsVisible();
			return user.click(screen.getByTestId(`folder-accordion-item-${folder.id}`));
		},
		confirm: (user: UserEvent): Promise<void> => {
			const button = screen.getByRole('button', { name: /move/i });
			return user.click(button);
		}
	};
};
