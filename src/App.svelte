<script lang="ts">
  import { fade } from 'svelte/transition';
  import { onMount } from 'svelte';
  import Counter from './lib/Counter.svelte';
  import Divider from './lib/Divider.svelte';
  import type { Item, Transaction, User } from './lib/Models';
  import UsersList from './lib/UsersList.svelte';
  import ItemsList from './lib/ItemsList.svelte';
  import { errorMsg } from './lib/store';

  // Drawer
  let drawer: any;
  let elDrawerOpenButton: any;
  let elDrawerCloseButton: any;

  // Dialog
  let dialog: any;
  let dialogMode: 'export' | 'import' = $state('export');
  let elDialogCloseButton: any;
  let dialogData = $state('');

  // User form
  let userInput = $state('');

  // Item form
  let initItem = { name: '', cost: 0, paidById: '', participantIds: [] };
  let itemForm: Item = $state({ ...initItem });
  let elPaidBy: any;
  let elParticipants: any;

  let users: User[] = $state([]);
  let items: Item[] = $state([]);

  let usersNet = $derived(
    users.map(user => {
      let net = 0;
      for (let item of items) {
        if (item.paidById === user.id) net += item.cost;

        if (item.participantIds) {
          // Share cost by participants
          let owes = item.cost / item.participantIds.length;
          if (item.participantIds.includes(user.id)) net -= owes;
          // } else if (item.participants) {
          //   // TODO: Ability to owe amount custom per user
          //   let participant = item.participants.find(p => p.id === user.id);
          //   if (participant) {
          //     net -= participant.owes;
          //   }
        } else {
          // Share the costs equally
          let owes = item.cost / users.length;
          net -= owes;
        }
      }
      return { ...user, net };
    })
  );

  let transactions = $derived.by(() => {
    let result = [];
    if (usersNet.length > 0) {
      while (!usersNet.map(u => u.net).every(isZero)) {
        let min = Math.min(...usersNet.map(u => u.net));
        let max = Math.max(...usersNet.map(u => u.net));
        let minUser = usersNet.find(u => u.net === min)!;
        let maxUser = usersNet.find(u => u.net === max)!;
        let owes = Math.min(Math.abs(minUser.net), Math.abs(maxUser.net));
        let transaction: Transaction = {
          debtorId: minUser.id,
          recipientId: maxUser.id,
          owes,
        };
        result.push(transaction);

        for (let user of usersNet) {
          if (transaction.debtorId === user.id) user.net += transaction.owes;
          if (transaction.recipientId === user.id) user.net -= transaction.owes;
        }
      }
    }
    return result;
  });

  // Hook up shoelace component events
  onMount(() => {
    // Drawer
    elDrawerOpenButton?.addEventListener('click', () => drawer.show());
    elDrawerCloseButton?.addEventListener('click', () => drawer.hide());

    // Dialog
    elDialogCloseButton.addEventListener('click', () => dialog.hide());

    // Item form
    elPaidBy?.addEventListener('sl-change', (e: any) => {
      itemForm.paidById = e?.target.value;
    });
    elParticipants?.addEventListener('sl-change', (e: any) => {
      itemForm.participantIds = [...e?.target.value];
    });
  });

  function isZero(n: number) {
    return Number(n.toFixed(5)) === 0;
  }

  function onKeyUp(e: any) {
    if (e.key === 'Enter' || e.keyCode === 13) {
      addUser();
    }
  }

  function addUser() {
    users.push({ id: (+new Date()).toString(), name: userInput });
    userInput = '';
  }

  function addItem() {
    let newItem = { ...itemForm };

    if (
      !itemForm.participantIds ||
      (itemForm.participantIds.length === users.length && users.length > 0)
    ) {
      delete newItem.participantIds;
    }
    items.push(newItem);

    itemForm = { ...initItem };
    elPaidBy.value = '';
    elParticipants.value = [];
  }

  function exportData() {
    dialogMode = 'export';
    dialogData = JSON.stringify({ users, items }, null, 2);
    dialog.show();
  }

  function importData() {
    dialogMode = 'import';
    dialogData = '';
    dialog.show();
  }

  function onImport() {
    try {
      let json = JSON.parse(dialogData);
      users = json.users;
      items = json.items;
    } catch (error) {
      console.error(error);
    }
    dialog.hide();
  }

  function loadBlank() {
    users = [];
    items = [];
  }

  function loadExample1() {
    users = [
      { id: '1', name: 'Person 1' },
      { id: '2', name: 'Person 2' },
      { id: '3', name: 'Person 3' },
    ];
    items = [
      { name: 'item 1', cost: 19.5, paidById: '1' },
      { name: 'item 2', cost: 4, paidById: '1' },
      { name: 'item 3', cost: 10, paidById: '2' },
      { name: 'item 4', cost: 5, paidById: '3' },
      { name: 'item 5', cost: 3.83, paidById: '2', participantIds: ['1'] },
    ];
  }

  function getUserById(id: string): User {
    let user = users.find(u => u.id == id);
    if (!user) {
      errorMsg.set('User not found');
      throw new Error($errorMsg);
    }
    return user;
  }
</script>

<main>
  <Divider />

  <h1 class="title">Svelte Costs Calculator</h1>

  <div class="center gap-2">
    <sl-button variant="warning" pill bind:this={elDrawerOpenButton}>Open Help</sl-button>
    <sl-button-group label="Data">
      <!-- svelte-ignore a11y_click_events_have_key_events -->
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <sl-button variant="neutral" pill onclick={exportData}>Export</sl-button>
      <!-- svelte-ignore a11y_click_events_have_key_events -->
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <sl-button variant="neutral" pill onclick={importData}>Import</sl-button>
    </sl-button-group>
    <sl-button-group label="Load">
      <!-- svelte-ignore a11y_click_events_have_key_events -->
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <sl-button variant="neutral" pill onclick={loadBlank}>Load Blank</sl-button>
      <!-- svelte-ignore a11y_click_events_have_key_events -->
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <sl-button variant="neutral" pill onclick={loadExample1}>Load Example</sl-button>
    </sl-button-group>
  </div>

  {#if $errorMsg}
    <sl-alert variant="danger" open style="margin-top: 1rem;">
      <sl-icon slot="icon" name="exclamation-octagon"></sl-icon>
      <strong>Error</strong><br />
      {$errorMsg}
      <!-- svelte-ignore a11y_click_events_have_key_events -->
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <sl-icon-button
        variant="danger"
        pill
        name="x-circle"
        onclick={() => errorMsg.set('')}
        style="position: absolute; top: 0.25rem; right: 0.25rem; color: var(--sl-color-danger-600)"
      >
      </sl-icon-button>
    </sl-alert>
  {/if}

  <Divider />

  <div class="flex flex-col gap-2">
    <div class="header">Users</div>

    <div class="flex gap-2">
      <input placeholder="Add user" bind:value={userInput} onkeyup={onKeyUp} />
      <!-- svelte-ignore a11y_click_events_have_key_events -->
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <sl-button variant="primary" pill onclick={addUser}
        >Add<sl-icon name="plus-circle" style="margin-left: 0.25rem;"></sl-icon>
      </sl-button>
    </div>

    <UsersList bind:users bind:items />
  </div>

  <Divider />

  <div class="flex flex-col gap-2" style="display: {users.length > 0 ? 'flex' : 'none'};">
    <div class="header">Costs</div>

    <table>
      <thead>
        <tr>
          <th style="width: 15px;">#</th>
          <th>Item</th>
          <th>Cost</th>
          <th>Paid By</th>
          <th>Participants</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td></td>
          <td><input type="text" placeholder="Item" bind:value={itemForm.name} /></td>
          <td><input type="number" placeholder="Cost" bind:value={itemForm.cost} /></td>
          <td>
            <sl-select placeholder="Select one" pill bind:this={elPaidBy}>
              {#each users as user}
                <sl-option value={user.id}>{user.name}</sl-option>
              {/each}
            </sl-select>
          </td>
          <td>
            <sl-select
              placeholder="Choose"
              value=""
              multiple
              maxOptionsVisible="1"
              clearable
              pill
              bind:this={elParticipants}
            >
              {#each users as user}
                <sl-option value={user.id}>{user.name}</sl-option>
              {/each}
            </sl-select>
          </td>
          <td class="pr-1">
            <!-- svelte-ignore a11y_click_events_have_key_events -->
            <!-- svelte-ignore a11y_no_static_element_interactions -->
            <sl-button
              variant="primary"
              pill
              onclick={addItem}
              disabled={users.length === 0 || Object.values(itemForm).some(v => v === '')}
              >Add<sl-icon name="plus-circle" style="margin-left: 0.25rem;"></sl-icon>
            </sl-button>
          </td>
        </tr>

        <ItemsList bind:items bind:users />
      </tbody>
    </table>
  </div>

  <Divider />

  <div class="flex flex-col gap-2" style="display: {users.length > 0 ? 'flex' : 'none'};">
    <div class="header">Result</div>

    {#if transactions.length === 0}
      <span>No payment needed</span>
    {/if}

    {#each transactions as t}
      <div class="flow-text">
        <sl-badge variant="success" pill>{getUserById(t.debtorId).name}</sl-badge> owes
        <sl-badge variant="success" pill>{getUserById(t.recipientId).name}</sl-badge>
        <b
          ><sl-format-number type="currency" currency="USD" value={t.owes} lang="en-US"
          ></sl-format-number></b
        >
      </div>
    {/each}
  </div>

  <Divider />

  <sl-drawer label="Help" placement="top" class="drawer-placement-top" bind:this={drawer}>
    <div>
      <dt>How to use:</dt>
      <dd>1. Enter list of users one by one</dd>
      <dd>2. Fill out items info, choose paid by, choose participants, click add</dd>
      <dd>3. Result calculation will be shown at bottom</dd>
    </div>
    <sl-button slot="footer" variant="primary" bind:this={elDrawerCloseButton}>Close</sl-button>
  </sl-drawer>

  <sl-dialog label={`Data ${dialogMode}`} class="dialog-overview" bind:this={dialog}>
    <textarea bind:value={dialogData}></textarea>

    {#if dialogMode === 'export'}
      <sl-copy-button slot="footer" value={dialogData}></sl-copy-button>
    {:else if dialogMode === 'import'}
      <!-- svelte-ignore a11y_click_events_have_key_events -->
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <sl-button slot="footer" variant="primary" onclick={onImport}>Import</sl-button>
    {/if}
    <sl-button slot="footer" variant="primary" bind:this={elDialogCloseButton}>Close</sl-button>
  </sl-dialog>
</main>

<style>
</style>
