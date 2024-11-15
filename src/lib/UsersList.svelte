<script lang="ts">
  import { fade } from 'svelte/transition';
  import type { Item, User } from './Models';
  import { errorMsg } from './store';

  let { items = $bindable(), users = $bindable() }: { items: Item[]; users: User[] } = $props();

  function removeUser(index: number) {
    let userToRemove = users[index];
    if (
      items.some(
        item => item.paidById === userToRemove.id || item.participantIds?.includes(userToRemove.id)
      )
    ) {
      errorMsg.set('User is being used');
      return;
    } else {
      errorMsg.set('');
    }
    users.splice(index, 1);
  }
</script>

<div class="flex">
  {#each users as user, i (user)}
    <sl-badge variant="success" pill transition:fade>
      <div class="center" style="margin-left: 0.5rem;">{user.name}</div>
      <div class="remove-btn">
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <sl-icon-button name="x-circle" onclick={() => removeUser(i)}></sl-icon-button>
      </div>
    </sl-badge>
  {/each}
</div>

<style>
</style>
