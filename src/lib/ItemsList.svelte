<script lang="ts">
  import { fade } from 'svelte/transition';
  import type { Item, User } from './Models';

  let { items = $bindable(), users = $bindable() }: { items: Item[]; users: User[] } = $props();

  function getUserById(id: string): User {
    let user = users.find(u => u.id == id);
    if (!user) throw new Error('User not found');
    return user;
  }

  function removeItem(index: number) {
    items.splice(index, 1);
  }
</script>

{#each items as item, i}
  <tr transition:fade>
    <td><div style="margin-left: -8px;"><sl-badge>{i + 1}</sl-badge></div></td>
    <td>{item.name}</td>
    <td
      ><sl-format-number type="currency" currency="USD" value={item.cost} lang="en-US"
      ></sl-format-number></td
    >
    <td><sl-badge variant="success" pill>{getUserById(item.paidById).name}</sl-badge></td>
    <td>{item.participantIds ? item.participantIds.map(u => getUserById(u).name) : 'Everyone'}</td>
    <td>
      <!-- svelte-ignore a11y_click_events_have_key_events -->
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <sl-button variant="danger" pill onclick={() => removeItem(i)}
        >Remove<sl-icon name="x-circle" style="margin-left: 0.25rem;"></sl-icon>
      </sl-button>
    </td>
  </tr>
{/each}
