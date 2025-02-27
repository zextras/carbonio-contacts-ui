/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { act, fireEvent, waitFor } from '@testing-library/react';
import { HttpResponse } from 'msw';

import { useTagStore } from '../../../../carbonio-ui-commons/store/zustand/tags';
import { createAPIInterceptor } from '../../../../carbonio-ui-commons/test/mocks/network/msw/create-api-interceptor';
import { buildSoapResponse } from '../../../../carbonio-ui-commons/test/mocks/utils/soap';
import { screen, setupTest } from '../../../../carbonio-ui-commons/test/test-setup';
import { TESTID_SELECTORS, TIMERS } from '../../../../constants/tests';
import { TagsAccordion } from '../tags-accordion';

jest.mock('../../../../carbonio-ui-commons/integrations/search/use-run-search', () => ({
	useRunSearchIntegration: jest.fn()
}));

describe('TagsAccordion', () => {
	it.todo('performs a search when clicking the tag');
	it('delete tag', async () => {
		useTagStore.setState({ tags: { '1': { id: '1', name: 'testTag' } } });

		const { user } = setupTest(<TagsAccordion />);

		const tagsAccordion = await screen.findByText('Tags');
		expect(tagsAccordion).toBeVisible();

		await user.click(screen.getByTestId(TESTID_SELECTORS.icons.accordionExpandAction));
		act(() => {
			jest.advanceTimersByTime(TIMERS.dropdown.registerListeners);
		});
		const testTag = await screen.findByText('testTag');
		expect(testTag).toBeVisible();
		// user.rightClick dow not work
		fireEvent.contextMenu(testTag);
		const deleteTag = await screen.findByText(/delete tag/i);
		expect(deleteTag).toBeVisible();
		await user.click(deleteTag);
		act(() => {
			jest.advanceTimersByTime(TIMERS.modal.delayOpen);
		});

		const deleteTagButton = screen.getByRole('button', { name: 'Delete' });
		const deleteTagInterceptor = createAPIInterceptor(
			'post',
			'/service/soap/TagActionRequest',
			HttpResponse.json(
				buildSoapResponse({
					TagActionResponse: {
						action: [{ id: '1', op: 'delete' }]
					}
				})
			)
		);
		await user.click(deleteTagButton);
		await waitFor(async () => {
			expect(deleteTagInterceptor.getCalledTimes()).toBe(1);
		});
	});
	it('should create a new tag after filling in the create tag modal opened from the contextual menu', async () => {
		const createTagInterceptor = createAPIInterceptor(
			'post',
			'/service/soap/CreateTagRequest',
			HttpResponse.json(
				buildSoapResponse({
					CreateTagResponse: {
						tag: [{ id: '1', name: 'My new tag' }]
					}
				})
			)
		);
		const { user } = setupTest(<TagsAccordion />);

		const tagsAccordion = await screen.findByText('Tags');
		expect(tagsAccordion).toBeVisible();

		await user.rightClick(tagsAccordion);
		const createTag = await screen.findByText(/create tag/i);
		await user.click(createTag);
		act(() => {
			jest.advanceTimersByTime(TIMERS.modal.delayOpen);
		});

		const modalTitle = await screen.findByText('Create a new Tag');
		expect(modalTitle).toBeVisible();
		const tagInput = await screen.findByRole('textbox', { name: /tag name/i });
		await user.type(tagInput, 'My new tag');
		const createTagButton = screen.getByRole('button', { name: 'Create' });
		expect(createTagButton).toBeEnabled();
		await user.click(createTagButton);

		await waitFor(async () => {
			expect(createTagInterceptor.getCalledTimes()).toBe(1);
		});
		await waitFor(async () => {
			expect(modalTitle).not.toBeVisible();
		});
	});
});
