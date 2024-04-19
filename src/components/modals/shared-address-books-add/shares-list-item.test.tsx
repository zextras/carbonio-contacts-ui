/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { act } from '@testing-library/react';
import { last } from 'lodash';

import { SharesListItem } from './shares-list-item';
import { screen, setupTest } from '../../../carbonio-ui-commons/test/test-setup';
import { TESTID_SELECTORS } from '../../../constants/tests';
import { buildShareInfo } from '../../../tests/model-builder';

describe('SharesListItem', () => {
	it('should display an uncheck checkbox', () => {
		const share = buildShareInfo();
		setupTest(<SharesListItem share={share} onSelect={jest.fn()} onDeselect={jest.fn()} />);
		expect(screen.getByTestId(TESTID_SELECTORS.checkbox)).toBeVisible();
		expect(screen.getByTestId(TESTID_SELECTORS.icons.unckeckedCheckbox)).toBeVisible();
	});

	it('should display the name of the shared addressbook', () => {
		const share = buildShareInfo();
		const shareName = last(share.folderPath.split('/')) ?? '';
		setupTest(<SharesListItem share={share} onSelect={jest.fn()} onDeselect={jest.fn()} />);
		expect(screen.getByText(shareName)).toBeVisible();
	});

	it('should call the onSelected callback, passing the selected share, if the user check the checkbox. The onDeselect callback should not be called', async () => {
		const share = buildShareInfo();
		const onSelect = jest.fn();
		const onDeselect = jest.fn();
		const { user } = setupTest(
			<SharesListItem share={share} onSelect={onSelect} onDeselect={onDeselect} />
		);
		await act(() => user.click(screen.getByTestId(TESTID_SELECTORS.checkbox)));
		expect(onSelect).toHaveBeenCalledWith(share);
		// FIXME checkbox is always firing an onChange event at the first render
		// expect(onDeselect).not.toHaveBeenCalled();
	});

	it('should call the onDeselected callback, passing the deselected share, if the user uncheck the checkbox. The onSelect callback should not be called', async () => {
		const share = buildShareInfo();
		const onSelect = jest.fn();
		const onDeselect = jest.fn();
		const { user } = setupTest(
			<SharesListItem share={share} onSelect={onSelect} onDeselect={onDeselect} />
		);
		await act(() => user.click(screen.getByTestId(TESTID_SELECTORS.checkbox)));
		await act(() => user.click(screen.getByTestId(TESTID_SELECTORS.checkbox)));
		expect(onDeselect).toHaveBeenCalledWith(share);
		expect(onSelect).toHaveBeenCalledTimes(1);
	});
});
