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

	async function apiRequest(key: string) {
		const res = await fetch(`/api/${key}`, { method: 'POST' });
		if (!res.ok) {
			const json = await res.json();
			alert(JSON.stringify(json));
			throw new Error('Network response was not ok.');
		}
	}

	async function changeVolume(e: Event) {
		const volumeStr = (e.target as HTMLInputElement).value;
		const volume = parseFloat(volumeStr);
		const res = await fetch(`/api/media/volume`, {
			method: 'POST',
			body: JSON.stringify({ volume })
		});
		if (!res.ok) {
			const json = await res.json();
			alert(JSON.stringify(json));
			throw new Error('Network response was not ok.');
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
			<button class="button is-large" on:click={() => apiRequest('media/prev-track')}> ⏮️ </button>
			<button class="button is-large" on:click={() => apiRequest('media/play-pause')}> ⏯️ </button>
			<button class="button is-large" on:click={() => apiRequest('media/next-track')}> ⏭️ </button>
			<button class="button is-large" on:click={() => apiRequest('media/mute')}> 🔇 </button>
		</div>
		<input
			class="slider is-fullwidth is-circle"
			step="0.005"
			min="0"
			max="1"
			value="0.1"
			type="range"
			on:input={changeVolume}
		/>
		
	</div>
</main>

<style lang="scss">
	main {
		max-width: 100vw;
	}
</style>
