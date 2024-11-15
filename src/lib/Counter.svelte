<script lang="ts">
  let count: number = $state(0);
  const increment = () => {
    count += 1;
  };
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<sl-button variant="primary" pill onclick={increment}>
  count is {count} <sl-icon name="gear"></sl-icon>
</sl-button>
