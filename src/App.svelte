<script>
  // @ts-check
  var count = 0;
  var msecsFirst = 0;
  var msecsPrevious = 0;
  let avgVal = "";
  let tapVal = "";
  let waitEl;
  let bpmAvg = "";
  $: wholeVal = Math.round(bpmAvg);

  function resetCount() {
    count = 0;
    avgVal = "";
    tapVal = "";
    this.blur();
  }

  function TapForBPM(e) {
    waitEl.blur();
    let timeSeconds = new Date();
    let msecs = timeSeconds.getTime();
    if (msecs - msecsPrevious > 1000 * waitEl.value) {
      count = 0;
    }

    if (count == 0) {
      avgVal = "First Beat";
      tapVal = "First Beat";
      msecsFirst = msecs;
      count = 1;
    } else {
      bpmAvg = (60000 * count) / (msecs - msecsFirst);
      avgVal = Math.round(bpmAvg * 100) / 100;
      count++;
      tapVal = count;
    }
    msecsPrevious = msecs;
    return true;
  }
  //if its a mobile device use 'touchstart'
  if (
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    )
  ) {
    var deviceEventType = "touchstart";
  } else {
    //If its not a mobile device use 'click'
    var deviceEventType = "keypress";
  }
  document.addEventListener(deviceEventType, TapForBPM);
</script>

<style>
  main {
    padding-right: 15px;
    padding-left: 15px;
    margin-right: auto;
    margin-left: auto;
    /* width: 64em; */
    text-align: center;
  }
  span.input {
    padding: 0.4em 1em;
    margin-left: 1em;
  }
</style>

<main class="cont">
  <p>Use any key - Start tapping to measure BPM</p>
  <p>
    <span>Average BPM</span>
    <span class="input">{avgVal}</span>
  </p>
  <p>
    <span>Nearest Whole</span>
    <span class="input">{wholeVal}</span>
  </p>
  <p>

    <span>Timing Taps</span>
    <span class="input">{tapVal}</span>
  </p>
  <p>
    <label for="pause">
      Pause
      <select bind:this={waitEl} name="pause">
        <option value="1">1</option>
        <option value="2" SELECTED>2</option>
        <option value="3">3</option>
        <option value="4">4</option>
        <option value="5">5</option>
      </select>
      second(s) or
      <input type="button" name="id" value="reset" on:click={resetCount} />
      to start again
    </label>
  </p>
</main>
