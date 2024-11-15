<div class="divider">
  <div class="ellipse"></div>
  <div class="ellipse ellipse2"></div>
</div>

<style>
  .divider {
    /* Clip edges, as some of the lines don't terminate nicely. */
    overflow: hidden;
    position: relative;
    width: 100%;
    height: 50px;
    margin-top: 0.5rem;
  }

  .ellipse {
    position: absolute;
    background: radial-gradient(
      ellipse,
      transparent,
      transparent 7px,
      white 7px,
      white 10px,
      transparent 11px
    );
    background-size: 36px 40px;
    width: 100%;
    height: 20px;
  }

  .ellipse2 {
    top: 20px;
    left: 18px;
    background-position: 0px -20px;
  }
</style>
