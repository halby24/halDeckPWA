<script lang="ts">
	// 起動ロックの参照を作成
	let wakeLock: WakeLockSentinel | null = null;
	$: wakeLockStatus = wakeLock && !wakeLock.released;

	//---------------------------------------------
	// screen wake lock をリクエストするための関数
	//---------------------------------------------
	async function toggleWakeLock() {
		if (!wakeLock) {
			// ブラウザは Screen Wake Lock を拒否することがあるので、
			// try...catch を使い拒否された場合の処理も記述する
			try {
				// screen wake lock をリクエストする
				wakeLock = await navigator.wakeLock.request('screen');
			} catch (err) {
				if (err instanceof Error) {
					console.error(`${err.name}, ${err.message}`);
					alert(`${err.name}, ${err.message}`);
				}
			}
		} else {
			// wakeLock が null であれば、
			// wakeLock が既にリクエストされているので、
			// wakeLock を解除する
			wakeLock?.release();
			wakeLock = null;
		}
	}
</script>

<main class="section">
	<div class="container">
		<button class="box button is-light is-fullwidth" on:click={toggleWakeLock}>
			Toggle Wake Lock
		</button>
		<div class="box">
			Wake Lock Status: {wakeLockStatus ? '😎 enabled' : '😪 disabled'}
		</div>
		<div class="buttons has-addons is-centered">
			<button class="button is-large"> ⏮️ </button>
			<button class="button is-large"> ⏯️ </button>
			<button class="button is-large"> ⏭️ </button>
		</div>
	</div>
</main>

<style lang="scss">
	main {
		max-width: 100vw;
	}
</style>
