/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { ReactNode } from 'react';

import { vi } from 'vitest';

import { generateAccount } from '@test-utils/accounts/account-generator';
import { generateSettings } from '@test-utils/settings/settings-generator';

const mockedAccount = generateAccount();
const mockedAccounts = [mockedAccount];
const mockedSettings = generateSettings();

export const mockCarbonioShell = (): void => {
	console.log('Mocking @zextras/carbonio-shell-ui module');

	vi.mock<typeof import('@zextras/carbonio-shell-ui')>(
		import('@zextras/carbonio-shell-ui'),
		async (importOriginal) => {
			const shell = await importOriginal();
			return {
				// ...shell,
				getUserAccount: vi.fn(() => mockedAccount),
				useUserAccount: vi.fn(() => mockedAccount),
				useUserAccounts: vi.fn(() => mockedAccounts),
				useUserSettings: vi.fn(() => mockedSettings),
				getUserSettings: vi.fn(() => mockedSettings),
				t: vi.fn((key: string) => key),
				replaceHistory: vi.fn(),
				pushHistory: vi.fn(),
				useBoard: vi.fn(),
				useAppContext: vi.fn(() => mockedAccounts),
				setAppContext: vi.fn(),
				getBridgedFunctions: vi.fn(),
				addBoard: vi.fn(),
				closeBoard: vi.fn(),
				updateBoardContext: vi.fn(),
				useBoardHooks: vi.fn().mockReturnValue({
					closeBoard: vi.fn(),
					updateBoard: vi.fn(),
					setCurrentBoard: vi.fn(),
					getBoardContext: vi.fn(),
					getBoard: vi.fn()
				}),
				minimizeBoards: vi.fn(),
				getCurrentRoute: vi.fn(),
				useIsCarbonioCE: vi.fn(() => false),
				useLocalStorage: vi.fn(),
				AppLink: vi.fn(({ children }: { children: ReactNode }) => <>{children}</>),
				editSettings: vi.fn(() => Promise.resolve({ data: {}, type: 'fulfilled' })),
				registerComponents: vi.fn(),
				registerActions: vi.fn(),
				addRoute: vi.fn(),
				removeRoute: vi.fn(),
				addSettingsView: vi.fn(),
				addBoardView: vi.fn(),
				getBoardById: vi.fn(),
				setCurrentBoard: vi.fn(),
				reopenBoards: vi.fn(),
				registerFunctions: vi.fn(),
				upsertApp: vi.fn(),
				useIntegratedComponent: vi.fn((id: string) => [
					vi.fn(() => <div data-testid="fake-component" />),
					false
				]),
				getIntegratedComponent: vi.fn((id: string) => [
					vi.fn(() => <div data-testid="fake-component" />),
					false
				]),
				getAction: vi.fn((type, id) => [undefined, false]),
				useActions: vi.fn().mockImplementation(() => []),
				getIntegratedFunction: vi.fn((id) => [jest.fn(), false]),
				useIntegratedFunction: vi.fn((id) => [jest.fn(), false]),
				useAuthenticated: vi.fn(() => true),
				NotificationManager: vi.fn()
			};
		}
	);
};
