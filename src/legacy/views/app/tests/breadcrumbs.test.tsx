/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { screen } from '@testing-library/react';

import { setupTest } from '@test-setup';
import { getFolderTranslatedNameByName } from '../../../utils/helpers';
import { Breadcrumbs } from '../breadcrumbs';

jest.mock('../../../utils/helpers', () => ({
	getFolderTranslatedNameByName: jest.fn()
}));

describe('Breadcrumbs', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('should render the breadcrumb path correctly', () => {
		(getFolderTranslatedNameByName as jest.Mock).mockImplementation((t, token) => token);

		setupTest(<Breadcrumbs folderPath="folder1/folder2" itemsCount={5} />);
		expect(screen.getByTestId('BreadcrumbPath')).toHaveTextContent('folder1 / folder2');
	});

	it('should display the correct items count', () => {
		setupTest(<Breadcrumbs folderPath="folder1/folder2" itemsCount={10} />);
		expect(screen.getByTestId('BreadcrumbCount')).toHaveTextContent('10');
	});

	it('should display the correct items count even count is more than 100', () => {
		setupTest(<Breadcrumbs folderPath="folder1/folder2" itemsCount={151} />);
		expect(screen.getByTestId('BreadcrumbCount')).toHaveTextContent('151');
	});

	it('should handle empty folderPath gracefully', () => {
		setupTest(<Breadcrumbs folderPath="" itemsCount={0} />);
		expect(screen.getByTestId('BreadcrumbPath')).toHaveTextContent('');
		expect(screen.getByTestId('BreadcrumbCount')).toHaveTextContent('0');
	});

	it('should call getFolderTranslatedNameByName for each folder in the path', () => {
		(getFolderTranslatedNameByName as jest.Mock).mockImplementation((t, token) => token);

		setupTest(<Breadcrumbs folderPath="folder1/folder2/folder3" itemsCount={500} />);
		expect(getFolderTranslatedNameByName).toHaveBeenCalledTimes(3);
		expect(getFolderTranslatedNameByName).toHaveBeenCalledWith(expect.any(Function), 'folder1');
		expect(getFolderTranslatedNameByName).toHaveBeenCalledWith(expect.any(Function), 'folder2');
		expect(getFolderTranslatedNameByName).toHaveBeenCalledWith(expect.any(Function), 'folder3');
	});
});
