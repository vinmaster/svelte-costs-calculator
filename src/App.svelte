<script lang="ts">
  import { onMount } from 'svelte';

  type UserId = number;
  interface User {
    id: UserId;
    name: string;
  }
  interface Participant {
    id: UserId;
    owes: number;
  }
  interface Item {
    name: string;
    cost: number;
    paidById: UserId;
    participants?: Participant[];
    participantIds?: UserId[];
  }
  interface Transaction {
    debtorId: UserId;
    debtorName: string;
    recipientId: UserId;
    recipientName: string;
    owes: number;
  }

  let users: User[] = [];
  let items: Item[] = [];
  let transactions: Transaction[] = [];
  let chipInstance: {
    chipsData: any[];
    addChip: ({ tag: string }) => void;
    deleteChip: (index: number) => void;
  };
  let newItem = { name: '', cost: '', paidById: '', participantIds: [] };

  onMount(() => {
    // Chips
    let options = {
      placeholder: 'Enter users here',
      onChipAdd: onChipsChange,
      onChipDelete: onChipsChange,
    };
    // @ts-ignore
    [chipInstance] = M.Chips.init(document.querySelectorAll('.chips'), options);
  });

  $: usersNet = users.map(user => {
    let net = 0;
    for (let item of items) {
      if (item.paidById === user.id) net += item.cost;

      if (item.participantIds) {
        // Share cost by participants
        let owes = item.cost / item.participantIds.length;
        if (item.participantIds.includes(user.id)) net -= owes;
      } else if (item.participants) {
        // TODO: Ability to owe amount custom per user
        let participant = item.participants.find(p => p.id === user.id);
        if (participant) {
          net -= participant.owes;
        }
      } else {
        // Share the costs equally
        let owes = item.cost / users.length;
        net -= owes;
      }
    }
    return { ...user, net };
  });

  $: usersNetTotal = usersNet.reduce((sum, val) => sum + val.net, 0);

  $: if (usersNet.length > 0) {
    let usersNetCopy = usersNet.map(u => {
      return { ...u };
    });
    transactions = [];
    while (!usersNetCopy.map(u => u.net).every(isZero)) {
      let min = Math.min(...usersNetCopy.map(u => u.net));
      let max = Math.max(...usersNetCopy.map(u => u.net));
      let minUser = usersNetCopy.find(u => u.net === min);
      let maxUser = usersNetCopy.find(u => u.net === max);
      let owes = Math.min(Math.abs(minUser.net), Math.abs(maxUser.net));
      let transaction: Transaction = {
        debtorId: minUser.id,
        debtorName: minUser.name,
        recipientId: maxUser.id,
        recipientName: maxUser.name,
        owes,
      };
      transactions.push(transaction);

      for (let user of usersNetCopy) {
        if (transaction.debtorId === user.id) user.net += transaction.owes;
        if (transaction.recipientId === user.id) user.net -= transaction.owes;
      }
    }
  }

  function addItem() {
    console.log(newItem.participantIds);
    let item = {
      name: newItem.name,
      cost: newItem.cost,
      paidById: newItem.paidById,
      participantIds: undefined,
    };

    if (newItem.participantIds.length !== users.length && newItem.participantIds.length > 0) {
      item.participantIds = newItem.participantIds;
    }
    items = [...items, item as any];
    newItem = { name: '', cost: '', paidById: '', participantIds: [] };
    updateSelect();
  }

  function removeItem(index: number) {
    items = items.filter((item, i) => i !== index);
  }

  function loadBlank() {
    users = [];
    items = [];
    transactions = [];
    while (chipInstance.chipsData.length !== 0) {
      chipInstance.deleteChip(0);
    }
    updateSelect();
  }

  function loadExample1() {
    users = [
      { id: 1, name: 'Person 1' },
      { id: 2, name: 'Person 2' },
      { id: 3, name: 'Person 3' },
    ];
    items = [
      { name: 'item 1', cost: 19.5, paidById: 1 },
      { name: 'item 2', cost: 4, paidById: 1 },
      { name: 'item 3', cost: 10, paidById: 2 },
      { name: 'item 4', cost: 5, paidById: 3 },
      { name: 'item 5', cost: 3.83, paidById: 2, participantIds: [1] },
    ];
    for (let user of users) {
      chipInstance.addChip({ tag: user.name });
    }
    updateSelect();
  }

  function getUserById(id: UserId) {
    return users.find(u => u.id === id);
  }

  function updateSelect() {
    setTimeout(() => {
      //@ts-ignore
      M.FormSelect.init(document.querySelectorAll('select'));
    }, 0);
  }

  function onChipsChange() {
    // console.log(chipInstance.chipsData);
    let newUsers = chipInstance.chipsData.map(({ tag }, index) => {
      return { id: index + 1, name: tag };
    });
    // for (let i = 0; i < items.length; ) {
    //   let item = items[i];
    //   let userIds = newUsers.map(u => u.id);
    //   if (item.participantIds) {
    //     let intersection = new Set(userIds.filter(id => new Set(item.participantIds).has(id)));
    //     if (!userIds.includes(item.paidById) && intersection.size !== 0) {
    //       items = items.filter((_, j) => i !== j);
    //     } else {
    //       i++;
    //     }
    //   }
    // }
    users = newUsers;
    if (users.length === 0) {
      newItem.paidById = '';
    }
    // updateSelect();
  }

  function toCurrency(n: number) {
    return `$${n.toFixed(2)}`;
  }

  function isZero(n) {
    return Number(n.toFixed(5)) === 0;
  }

  function stringify(x) {
    return JSON.stringify(x, null, 2);
  }

  function print(x) {
    return `<code><pre>${stringify(x)}</pre></code>`;
  }
</script>

<main>
  <div class="container">
    <div class="row">
      <h1 class="center-align">Svelte Costs Calculator</h1>
      <div class="col s12 m6">
        <dt>How to use:</dt>
        <dd>1. Enter list of users one by one and hit enter</dd>
        <dd>2. Fill out items info, choose paid by, choose participants, click add</dd>
        <dd>3. Result calculation will be shown at bottom</dd>
      </div>
      <div class="col s12 m6">
        <div class="row">Load Examples:</div>
        <button class="waves-effect waves-light btn" on:click={loadBlank}>Blank</button>
        <button class="waves-effect waves-light btn" on:click={loadExample1}>Load Example 1</button>
      </div>
    </div>

    <div class="row blue-text">
      <h5 class="center-align">Users</h5>
      <div class="chips">
        <input class="custom-class blue-text" />
      </div>
    </div>

    <div class="row">
      <h5 class="center-align blue-text">Items Table</h5>
      <table class="striped z-depth-2 mb-1">
        <thead>
          <tr>
            <th class="p-1">#</th>
            <th>Item Name</th>
            <th>Cost</th>
            <th>Paid By</th>
            <th>Participants</th>
            <th class="pr-1">Action</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td />
            <td><input type="text" placeholder="Item Name" bind:value={newItem.name} /></td>
            <td><input type="number" placeholder="Item Cost" bind:value={newItem.cost} /></td>
            <td>
              <select bind:value={newItem.paidById}>
                <option value="" disabled selected>Choose</option>
                {#each users as user}
                  <option value={user.id}>{user.name}</option>
                {/each}
              </select>
            </td>
            <td>
              <select multiple bind:value={newItem.participantIds}>
                <option value="" disabled selected>Choose</option>
                {#each users as user}
                  <option value={user.id}>{user.name}</option>
                {/each}
              </select>
            </td>
            <td class="pr-1">
              <button
                class="waves-effect waves-light btn green darken-1"
                disabled={users.length === 0 || Object.values(newItem).some(v => v === '')}
                on:click={addItem}>Add</button
              >
            </td>
          </tr>
          {#each items as item, i}
            <tr>
              <td class="p-1">{i + 1}</td>
              <td>{item.name}</td>
              <td>{toCurrency(item.cost)}</td>
              <td>{getUserById(item.paidById).name}</td>
              <td
                >{item.participantIds?.map(u => getUserById(u).name)
                  ? item.participantIds?.map(u => getUserById(u).name)
                  : 'Everyone'}</td
              >
              <td class="pr-1">
                <button
                  class="waves-effect waves-light btn red darken-4"
                  on:click={() => removeItem(i)}>Remove</button
                >
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>

    <div class="row">
      <h5 class="center-align blue-text">Result</h5>
      <span hidden={transactions.length !== 0}>Fill out users and items table first</span>
      {#each transactions as t}
        <div class="flow-text">
          <b>{t.debtorName}</b> owes <b>{t.recipientName}</b>
          <b>{toCurrency(t.owes)}</b>
        </div>
      {/each}
    </div>
  </div>
</main>

<!-- 
{@html print(usersNet)}
-->
<style>
  h1 {
    color: #ff3e00;
    text-transform: uppercase;
    font-size: 3rem;
    font-weight: 100;
  }

  main {
    padding-bottom: 5rem;
  }

  .p-1 {
    padding: 1rem;
  }

  .mb-1 {
    margin-bottom: 1rem;
  }

  .pr-1 {
    padding-right: 1rem;
  }

  .btn {
    width: 100%;
  }
</style>
