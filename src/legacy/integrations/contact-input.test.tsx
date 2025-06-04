/* eslint-disable @typescript-eslint/no-use-before-define */
/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { ReactElement, useState } from 'react';

import { faker } from '@faker-js/faker';
import { act, fireEvent, waitFor, within } from '@testing-library/react';
import { ChipAction } from '@zextras/carbonio-design-system';
import {
	CONTACT_TYPES,
	ContactInputOnChange,
	ContactInputValue,
	JSNS
} from '@zextras/carbonio-ui-commons';

import { ContactInput } from './contact-input';
import { TESTID_SELECTORS } from '../../constants/tests';
import { registerGetDistributionListHandler } from '../../tests/msw-handlers/get-distribution-list';
import { generateDistributionList } from '../../tests/utils';
import { FullAutocompleteRequest, FullAutocompleteResponse } from '../types/contact';
import {
	clickExpandDL,
	createAutocompleteInterceptor,
	createDistributionListChip,
	createGetContactRequestInterceptor,
	createGetDistributionListInterceptor,
	createSimpleChip,
	editInvalidChipAction,
	editValidChipAction,
	generateGroupMemberChip,
	selectAllMembersInDL,
	SELECT_ALL,
	typeAndSelectOptionFromDropdown
} from './test/mocks';
import {
	GetDistributionListRequest,
	GetDistributionListResponse
} from '../../network/api/get-distribution-list';
import { registerFullAutocompleteHandler } from '../../tests/msw-handlers/full-autocomplete';
import { registerGetDistributionListMembersHandler } from '../../tests/msw-handlers/get-distribution-list-members';
import { UserEvent, screen, setupTest } from '@test-setup';
import { createSoapAPIInterceptor } from '@test-utils/network/msw/create-api-interceptor';

const VALID_EMAIL = 'valid@email.it';
const INVALID_EMAIL = 'invalid@email';

const TRIGGER_ADD_CONTACT_CHARACTER = `,`;

const CUSTOM_ACTION: ChipAction = {
	id: 'custom-action',
	type: 'button',
	icon: 'PeopleOutline',
	onClick: () => undefined
};

describe('Contact input', () => {
	it('should render a textbox', async () => {
		const placeholder = faker.string.alpha();
		setupTest(<ContactInput defaultValue={[]} placeholder={placeholder} orderedAccountIds={[]} />);
		expect(screen.getByRole('textbox', { name: placeholder })).toBeVisible();
	});

	it('should render a dropdown with a contact', async () => {
		const contact = {
			email: faker.internet.email(),
			first: faker.person.firstName(),
			isGroup: false
		};

		const autocompleteInterceptor = createSoapAPIInterceptor<
			FullAutocompleteRequest,
			FullAutocompleteResponse
		>('FullAutocomplete', {
			canBeCached: true,
			match: [contact]
		});

		const { user } = setupTest(<ContactInput defaultValue={[]} orderedAccountIds={[]} />);

		const input = screen.getByRole('textbox');
		await user.type(input, contact.email);
		const dropdown = await screen.findByTestId(TESTID_SELECTORS.dropdownList);
		await autocompleteInterceptor;
		expect(await within(dropdown).findByText(contact.first)).toBeVisible();
		expect(await within(dropdown).findByText(contact.email)).toBeVisible();
	});

	test('should not override previous chip label', async () => {
		const onChangeFn = jest.fn();
		const contact = {
			email: 'simple@chip.it',
			first: 'first name',
			isGroup: false
		};
		const initialChip = createSimpleChip({
			label: 'simple chip',
			email: 'simple@chip.it',
			id: 'simple@chip.it'
		});
		const autocompleteInterceptor = createAutocompleteInterceptor([contact]);

		const { user } = setupTest(
			<ContactInput defaultValue={[initialChip]} orderedAccountIds={[]} onChange={onChangeFn} />
		);
		await typeAndSelectOptionFromDropdown(user, contact.first);
		await autocompleteInterceptor;

		expect(onChangeFn).toHaveBeenCalledWith([
			expect.objectContaining({ label: initialChip.label })
		]);
	});

	it('should render a dropdown with a contact group with an avatar', async () => {
		const contact = {
			display: 'testgroup',
			isGroup: true,
			id: '123'
		};

		const autocompleteInterceptor = createSoapAPIInterceptor<
			FullAutocompleteRequest,
			FullAutocompleteResponse
		>('FullAutocomplete', {
			canBeCached: true,
			match: [contact]
		});

		const { user } = setupTest(<ContactInput defaultValue={[]} orderedAccountIds={[]} />);

		const input = screen.getByRole('textbox');
		await user.type(input, contact.display);
		const dropdown = await screen.findByTestId(TESTID_SELECTORS.dropdownList);
		await autocompleteInterceptor;
		const avatar = await within(dropdown).findByTestId(TESTID_SELECTORS.avatar);
		expect(await within(dropdown).findByText(contact.display)).toBeVisible();
		expect(within(avatar).queryByText('?')).not.toBeInTheDocument();
	});
	describe('pasting', () => {
		test('a simple email should display it correctly', async () => {
			const { user } = setupTest(<TestableContactInput />);

			await paste(user, screen.getByRole('textbox'), 'bruno@domain.loc');

			expect(await screen.findByText('bruno@domain.loc')).toBeInTheDocument();
		});

		it('a complex string with multiple emails should display them all', async () => {
			const complexText =
				'dan@email.it\n"Invalid"\n<a@valid.email>;\n"Another" <another@valid.it>;\n"not valid" <not@valid>';
			const { user } = setupTest(<TestableContactInput />);

			await paste(user, screen.getByRole('textbox'), complexText);

			expect(await screen.findByText('dan@email.it')).toBeInTheDocument();
			expect(await screen.findByText('a@valid.email')).toBeInTheDocument();
			expect(await screen.findByText('another@valid.it')).toBeInTheDocument();
			expect(await screen.findByText('"Invalid"')).toBeInTheDocument();
			expect(await screen.findByText('"not valid" <not@valid>')).toBeInTheDocument();
			expect(await screen.findAllByTestId('icon: AlertCircleOutline')).toHaveLength(2);
		});
	});

	it('edit a mail from a pasted list of emails should edit only the selected one and keep the others', async () => {
		const complexText = 'dan@email.it\n"Invalid"\n<a@valid.email>;\n"Another" <another@valid.it>';
		const { user } = setupTest(<TestableContactInput />);

		await paste(user, screen.getByRole('textbox'), complexText);

		const invalidChip = getChipWithText('"Invalid"');
		const invalidChipEditButton = within(invalidChip).getAllByRole('button')[0];

		await act(async () => {
			await user.click(invalidChipEditButton);
		});

		expect(await screen.findByText('dan@email.it')).toBeInTheDocument();
		expect(await screen.findByText('a@valid.email')).toBeInTheDocument();
		expect(await screen.findByText('another@valid.it')).toBeInTheDocument();
		expect(screen.queryByText('"Invalid"')).not.toBeInTheDocument();
		expect(screen.getByRole('textbox')).toHaveValue('"Invalid"');
	});

	it('edit a mail from a pasted list of emails and focus out should keep the edited chip', async () => {
		const complexText = 'dan@email.it\n"Invalid"\n<a@valid.email>;\n"Another" <another@valid.it>';
		const { user } = setupTest(<TestableContactInput />);

		await paste(user, screen.getByRole('textbox'), complexText);

		const invalidChip = getChipWithText('"Invalid"');
		const invalidChipEditButton = within(invalidChip).getAllByRole('button')[0];

		await act(async () => {
			await user.click(invalidChipEditButton);
		});

		fireEvent.focusOut(screen.getByRole('textbox'));

		expect(await screen.findByText('dan@email.it')).toBeInTheDocument();
		expect(await screen.findByText('a@valid.email')).toBeInTheDocument();
		expect(await screen.findByText('another@valid.it')).toBeInTheDocument();
		expect(await screen.findByText('"Invalid"')).toBeInTheDocument();
	});

	it('open custom contextmenu with a right click', async () => {
		const { user } = setupTest(<TestableContactInput />);

		await user.rightClick(screen.getByTestId('contact-input'));

		expect(await screen.findByText('Paste')).toBeInTheDocument();
		// we can't test the clipboard paste through context menu because it's not supported by jsdom
	});
	it('should set external contact chips as draggable if drag and drop is enabled', async () => {
		setupTest(
			<ContactInput defaultValue={[createSimpleChip()]} orderedAccountIds={[]} dragAndDropEnabled />
		);

		expect(screen.queryByTestId('default-chip')).toHaveProperty('draggable', true);
	});

	it('should NOT set external contact chips as draggable if drag and drop is disabled', async () => {
		setupTest(
			<ContactInput
				defaultValue={[createSimpleChip()]}
				orderedAccountIds={[]}
				dragAndDropEnabled={false}
			/>
		);
		expect(screen.queryByTestId('default-chip')).toHaveProperty('draggable', false);
	});
	it('should display multiple chips', async () => {
		const dl = createDistributionListChip(VALID_EMAIL);
		const dlInterceptor = createGetDistributionListInterceptor([
			{ id: dl.value.id, name: dl.label }
		]);

		setupTest(
			<ContactInput
				defaultValue={[createSimpleChip({ label: 'Test User' }), dl]}
				orderedAccountIds={[]}
			/>
		);

		await dlInterceptor;

		expect(await screen.findByText('Test User')).toBeVisible();
		expect(await screen.findByText(dl.value.email)).toBeVisible();
	});

	it('should create chip with edit action when chip is created by by pressing enter', async () => {
		const onChange = jest.fn();
		registerFullAutocompleteHandler([]);
		const { user } = setupTest(
			<ContactInput defaultValue={[]} orderedAccountIds={[]} onChange={onChange} />
		);
		await user.type(screen.getByRole('textbox'), VALID_EMAIL);
		await user.keyboard('{Enter}');
		expect(onChange).toHaveBeenCalledWith([
			expect.objectContaining({ actions: [editValidChipAction] })
		]);
	});

	describe('on simple contact', () => {
		it('renders the chip with the provided label', () => {
			const simpleContact = createSimpleChip({ label: 'AAA' });

			setupTest(<ContactInput defaultValue={[simpleContact]} orderedAccountIds={[]} />);

			expect(screen.getByText('AAA')).toBeVisible();
		});

		it('calls onChange with label equal to firstName if present in autocomplete', async () => {
			const first = 'My name is';
			const interceptor = createAutocompleteInterceptor([{ email: VALID_EMAIL, first }]);
			const onChange = jest.fn();
			const { user } = setupTest(
				<ContactInput onChange={onChange} defaultValue={[]} orderedAccountIds={[]} />
			);
			await typeAndSelectOptionFromDropdown(user, first);
			await interceptor;

			expect(onChange).toHaveBeenCalledWith([expect.objectContaining({ label: first })]);
		});
		it('calls onChange with label equal to email if no other field in autocomplete', async () => {
			const interceptor = createAutocompleteInterceptor([{ email: VALID_EMAIL }]);
			const onChange = jest.fn();
			const { user } = setupTest(
				<ContactInput onChange={onChange} defaultValue={[]} orderedAccountIds={[]} />
			);
			await typeAndSelectOptionFromDropdown(user, VALID_EMAIL);
			await interceptor;

			expect(onChange).toHaveBeenCalledWith([expect.objectContaining({ label: VALID_EMAIL })]);
		});
		it('calls onChange with label equal to fullname if present and no first, last or middle in autocomplete', async () => {
			const interceptor = createAutocompleteInterceptor([
				{ email: VALID_EMAIL, full: 'My fullname' }
			]);
			const onChange = jest.fn();
			const { user } = setupTest(
				<ContactInput onChange={onChange} defaultValue={[]} orderedAccountIds={[]} />
			);
			await typeAndSelectOptionFromDropdown(user, VALID_EMAIL);
			await interceptor;

			expect(onChange).toHaveBeenCalledWith([expect.objectContaining({ label: 'My fullname' })]);
		});
		it('calls onChange with label equal to first + middle + last even if fullname present in autocomplete', async () => {
			const interceptor = createAutocompleteInterceptor([
				{ email: VALID_EMAIL, full: 'My fullname', first: 'first', middle: 'middle', last: 'last' }
			]);
			const onChange = jest.fn();
			const { user } = setupTest(
				<ContactInput onChange={onChange} defaultValue={[]} orderedAccountIds={[]} />
			);
			await typeAndSelectOptionFromDropdown(user, VALID_EMAIL);
			await interceptor;

			expect(onChange).toHaveBeenCalledWith([
				expect.objectContaining({ label: 'first middle last' })
			]);
		});
		it('calls onChange with a chip with edit action after selecting a simple contact on the dropdown', async () => {
			const onChange = jest.fn();
			const autocompleteInterceptor = createAutocompleteInterceptor([
				{ email: VALID_EMAIL, isGroup: false }
			]);

			const { user } = setupTest(
				<ContactInput defaultValue={[]} orderedAccountIds={[]} onChange={onChange} />
			);
			await typeAndSelectOptionFromDropdown(user, VALID_EMAIL);
			await autocompleteInterceptor;
			expect(onChange).toHaveBeenCalledWith([
				expect.objectContaining({ actions: [editValidChipAction] })
			]);
		});
		it('should show display custom action if provided', async () => {
			const contactChipItem = createSimpleChip();
			registerGetDistributionListHandler(generateDistributionList(contactChipItem));
			setupTest(
				<ContactInput
					defaultValue={[
						{
							...contactChipItem,
							actions: [CUSTOM_ACTION]
						}
					]}
					orderedAccountIds={[]}
				/>
			);

			expect(
				screen.getByRoleWithIcon('button', { icon: `icon: ${CUSTOM_ACTION.icon}` })
			).toBeVisible();
		});
		it('should show remove action on value set from outside', () => {
			setupTest(<ContactInput defaultValue={[createSimpleChip()]} orderedAccountIds={[]} />);
			expect(
				screen.getByRoleWithIcon('button', { icon: TESTID_SELECTORS.icons.close })
			).toBeVisible();
		});
	});

	describe('on distribution list contact', () => {
		it('calls onChange with a chip with edit action after selecting a distribution list on the dropdown', async () => {
			const onChange = jest.fn();
			const autocompleteInterceptor = createAutocompleteInterceptor([
				{ email: VALID_EMAIL, isGroup: true }
			]);

			const { user } = setupTest(
				<ContactInput defaultValue={[]} orderedAccountIds={[]} onChange={onChange} />
			);
			await typeAndSelectOptionFromDropdown(user, VALID_EMAIL);
			await autocompleteInterceptor;
			expect(onChange).toHaveBeenCalledWith([
				expect.objectContaining({ actions: [editValidChipAction] })
			]);
		});
		it('should show custom action if provided', async () => {
			setupTest(
				<ContactInput
					defaultValue={[
						{
							...createDistributionListChip(VALID_EMAIL),
							actions: [CUSTOM_ACTION]
						}
					]}
					orderedAccountIds={[]}
				/>
			);
			expect(
				screen.getByRoleWithIcon('button', { icon: `icon: ${CUSTOM_ACTION.icon}` })
			).toBeVisible();
		});
		it('should show action to see the members list', async () => {
			setupTest(
				<ContactInput
					defaultValue={[
						{
							...createDistributionListChip(VALID_EMAIL),
							actions: [CUSTOM_ACTION]
						}
					]}
					orderedAccountIds={[]}
				/>
			);
			expect(
				screen.getByRoleWithIcon('button', { icon: TESTID_SELECTORS.icons.expandDL })
			).toBeVisible();
		});
		it('should not show the edit DL action if not provided in defaultValue', async () => {
			setupTest(
				<ContactInput
					defaultValue={[createDistributionListChip(VALID_EMAIL)]}
					orderedAccountIds={[]}
				/>
			);

			expect(
				screen.queryByRoleWithIcon('button', { icon: TESTID_SELECTORS.icons.editDL })
			).not.toBeInTheDocument();
		});
		it('should show remove action on value set from outside', () => {
			setupTest(
				<ContactInput
					defaultValue={[createDistributionListChip(VALID_EMAIL)]}
					orderedAccountIds={[]}
				/>
			);
			expect(
				screen.getByRoleWithIcon('button', { icon: TESTID_SELECTORS.icons.close })
			).toBeVisible();
		});

		it('calls onChange with all member in distribution list', async () => {
			const onChange = jest.fn();

			const getMemberHandler = registerGetDistributionListMembersHandler([
				'dlmember1@test.it',
				'dlmember2@test.it'
			]);
			const getDLInterceptor = createSoapAPIInterceptor<
				GetDistributionListRequest,
				GetDistributionListResponse
			>('GetDistributionList', {
				_jsns: JSNS.ACCOUNT,
				dl: [{ id: '123', name: 'dl@dl.test' }],
				requestId: ''
			});

			const { user } = setupTest(
				<ContactInput
					defaultValue={[createDistributionListChip(VALID_EMAIL)]}
					orderedAccountIds={[]}
					onChange={onChange}
				/>
			);
			await getDLInterceptor;
			await act(() => clickExpandDL(user));
			await getMemberHandler;

			await user.click(screen.getByRole('button', { name: SELECT_ALL }));

			expect(onChange).toHaveBeenCalledWith([
				expect.objectContaining({
					id: 'dlmember1@test.it',
					label: 'dlmember1@test.it',
					value: {
						email: 'dlmember1@test.it',
						id: 'dlmember1@test.it',
						type: 'CONTACT'
					}
				}),
				expect.objectContaining({
					id: 'dlmember2@test.it',
					label: 'dlmember2@test.it',
					value: {
						email: 'dlmember2@test.it',
						id: 'dlmember2@test.it',
						type: 'CONTACT'
					}
				})
			]);
		});

		it('should keep the previous simple chips after expanding a distribution list chip', async () => {
			const onChangeFn = jest.fn();
			const simpleChip = createSimpleChip({ label: 'simple chip', email: 'simple-chip@email.it' });
			const dlChip = createDistributionListChip('distribution-list@email.it');
			registerGetDistributionListMembersHandler(['dlmail1@email.test']);
			const dlInterceptor = createGetDistributionListInterceptor([
				{ id: dlChip.value.id, name: dlChip.label }
			]);

			const { user } = setupTest(
				<ContactInput
					defaultValue={[simpleChip, dlChip]}
					orderedAccountIds={[]}
					onChange={onChangeFn}
				/>
			);
			await dlInterceptor;
			await clickExpandDL(user);
			const selectAllButton = await screen.findByRole('button', { name: SELECT_ALL });
			await user.click(selectAllButton);

			expect(onChangeFn).toHaveBeenCalledWith([
				simpleChip,
				expect.objectContaining({
					id: 'dlmail1@email.test',
					label: 'dlmail1@email.test',
					value: { email: 'dlmail1@email.test', id: 'dlmail1@email.test', type: 'CONTACT' }
				})
			]);
		});
		it('should keep other distribution list chips after expanding a distribution list chip', async () => {
			const onChangeFn = jest.fn();
			const dl1Chip = createDistributionListChip('dl1@email.it');
			const dl2Chip = createDistributionListChip('dl2@email.it');
			const dlInterceptor = createGetDistributionListInterceptor([
				{ id: dl2Chip.value.id, name: dl2Chip.label }
			]);

			registerGetDistributionListMembersHandler(['memberFromDl2@email.test']);

			const { user } = setupTest(
				<ContactInput
					defaultValue={[dl1Chip, dl2Chip]}
					orderedAccountIds={[]}
					onChange={onChangeFn}
				/>
			);
			await dlInterceptor;
			const distributionListChips = await screen.findAllByTestId('distribution-list-chip');
			const distributionListChip2 = distributionListChips[1];
			await clickExpandDL(user, distributionListChip2);

			await selectAllMembersInDL(user);

			expect(onChangeFn).toHaveBeenCalledWith([
				dl1Chip,
				expect.objectContaining({
					id: 'memberFromDl2@email.test',
					label: 'memberFromDl2@email.test',
					value: {
						email: 'memberFromDl2@email.test',
						id: 'memberFromDl2@email.test',
						type: CONTACT_TYPES.CONTACT
					}
				})
			]);
		});
		it('should create DL member chip with edit action when after selecting all addresses in DL', async () => {
			const onChange = jest.fn();
			const dl = createDistributionListChip('dltest@test.com');
			const dlInterceptor = createGetDistributionListInterceptor([
				{ id: dl.value.email, name: dl.value.email }
			]);
			const getMembers = registerGetDistributionListMembersHandler(['member1@test.com']);

			const { user } = setupTest(
				<ContactInput defaultValue={[dl]} orderedAccountIds={[]} onChange={onChange} />
			);
			await dlInterceptor;
			await clickExpandDL(user);
			await selectAllMembersInDL(user);

			expect(getMembers).toHaveBeenCalledTimes(1);
			expect(onChange).toHaveBeenCalledWith([
				expect.objectContaining({
					id: 'member1@test.com',
					label: 'member1@test.com',
					actions: [editValidChipAction]
				})
			]);
		});
	});

	describe('on invalid contact', () => {
		const INVALID_CHIP = createSimpleChip({ email: INVALID_EMAIL });
		it('should show remove action on value set from outside', () => {
			setupTest(<ContactInput defaultValue={[INVALID_CHIP]} orderedAccountIds={[]} />);
			expect(
				screen.getByRoleWithIcon('button', { icon: TESTID_SELECTORS.icons.close })
			).toBeVisible();
		});
		it('should not show edit action if invalid contact is set from outside and actions not provided', () => {
			setupTest(<ContactInput defaultValue={[INVALID_CHIP]} orderedAccountIds={[]} />);
			expect(
				screen.queryByRoleWithIcon('button', { icon: TESTID_SELECTORS.icons.editChip })
			).not.toBeInTheDocument();
		});
		it('should call onChange with a chip with edit action if an invalid contact is added by typing', async () => {
			const onChange = jest.fn();
			const { user } = setupTest(
				<ContactInput defaultValue={[]} orderedAccountIds={[]} onChange={onChange} />
			);
			await act(async () => {
				await user.type(screen.getByRole('textbox'), INVALID_EMAIL);
			});
			await act(async () => {
				await user.type(screen.getByRole('textbox'), TRIGGER_ADD_CONTACT_CHARACTER);
			});
			expect(onChange).toHaveBeenCalledWith([
				expect.objectContaining({ actions: [editInvalidChipAction] })
			]);
		});
		it('should create an invalid chip with edit action after selecting a contact with invalid email from the dropdown', async () => {
			const onChange = jest.fn();
			const autocompleteInterceptor = createAutocompleteInterceptor([{ email: INVALID_EMAIL }]);

			const { user } = setupTest(
				<ContactInput defaultValue={[]} orderedAccountIds={[]} onChange={onChange} />
			);
			await typeAndSelectOptionFromDropdown(user, INVALID_EMAIL);
			await autocompleteInterceptor;
			expect(onChange).toHaveBeenCalledWith([
				expect.objectContaining({ actions: [editInvalidChipAction] })
			]);
		});
	});

	describe('on group selection', () => {
		it('should call onChange passing the members of the selected group', async () => {
			const onChange = jest.fn();
			const GROUP_NAME = 'GROUP_MAME';
			const autocompleteInterceptor = createAutocompleteInterceptor([
				{ display: GROUP_NAME, isGroup: true, id: 'id-1' }
			]);

			const groupMember1 = 'test1@test.com';
			const groupMember2 = 'test2@test.com';
			const groupMember3 = 'test3@test.com';
			const createGetContactInterceptor = createGetContactRequestInterceptor([
				{
					id: '5539',
					l: '7',
					d: 1732210444000,
					rev: 23712,
					fileAsStr: 'Test',
					_attrs: {
						nickname: 'Test Group',
						fullName: 'Test Group',
						type: 'group'
					},
					m: [
						{
							type: 'I',
							value: groupMember1
						},
						{
							type: 'I',
							value: groupMember2
						},
						{
							type: 'I',
							value: groupMember3
						}
					]
				}
			]);

			const { user } = setupTest(
				<ContactInput defaultValue={[]} orderedAccountIds={[]} onChange={onChange} />
			);

			await typeAndSelectOptionFromDropdown(user, GROUP_NAME);
			await autocompleteInterceptor;
			await createGetContactInterceptor;
			await waitFor(() => expect(onChange).toHaveBeenCalledTimes(1));
			await waitFor(() =>
				expect(onChange).toHaveBeenCalledWith([
					generateGroupMemberChip(groupMember1),
					generateGroupMemberChip(groupMember2),
					generateGroupMemberChip(groupMember3)
				])
			);
		});

		it('should not remove existing users/dl after adding a group', async () => {
			const onChange = jest.fn();
			const GROUP_NAME = 'GROUP_MAME';
			const autocompleteInterceptor = createAutocompleteInterceptor([
				{ display: GROUP_NAME, isGroup: true, id: 'id-1' }
			]);

			const groupMember1 = 'test1@test.com';
			const groupMember2 = 'test2@test.com';
			const groupMember3 = 'test3@test.com';
			const createGetContactInterceptor = createGetContactRequestInterceptor([
				{
					id: '5539',
					l: '7',
					d: 1732210444000,
					rev: 23712,
					fileAsStr: 'Test',
					_attrs: {
						nickname: 'Test Group',
						fullName: 'Test Group',
						type: 'group'
					},
					m: [
						{
							type: 'I',
							value: groupMember1
						},
						{
							type: 'I',
							value: groupMember2
						},
						{
							type: 'I',
							value: groupMember3
						}
					]
				}
			]);

			const simpleChip = createSimpleChip();
			const distributionListChip = createDistributionListChip(VALID_EMAIL);
			const { user } = setupTest(
				<ContactInput
					defaultValue={[simpleChip, distributionListChip]}
					orderedAccountIds={[]}
					onChange={onChange}
				/>
			);

			await typeAndSelectOptionFromDropdown(user, GROUP_NAME);
			await autocompleteInterceptor;
			await createGetContactInterceptor;
			await waitFor(() => expect(onChange).toHaveBeenCalledTimes(1));
			await waitFor(() =>
				expect(onChange).toHaveBeenCalledWith([
					expect.objectContaining(simpleChip),
					expect.objectContaining(distributionListChip),
					expect.objectContaining(generateGroupMemberChip(groupMember1)),
					expect.objectContaining(generateGroupMemberChip(groupMember2)),
					expect.objectContaining(generateGroupMemberChip(groupMember3))
				])
			);
		});
	});
});

function TestableContactInput(): ReactElement {
	const [defaultValue, setDefaultValue] = useState<ContactInputValue>([]);

	const onChange: ContactInputOnChange = (value) => {
		setDefaultValue([...defaultValue, ...value]);
	};

	return <ContactInput defaultValue={defaultValue} onChange={onChange} />;
}

async function paste(user: UserEvent, element: HTMLElement, text: string): Promise<void> {
	await user.click(element);
	await act(async () => {
		await user.paste({
			getData: () => text
		} as unknown as DataTransfer);
	});
}

function getChipWithText(text: string): HTMLElement {
	const chips = screen.queryAllByTestId('default-chip');
	const invalidChip = chips.find((chip) => within(chip).queryByText(text, { exact: false }));
	if (!invalidChip) throw new Error(`Chip not found with text: ${text}`);
	return invalidChip;
}
