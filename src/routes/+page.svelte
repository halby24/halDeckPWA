<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { PUBLIC_DOMAIN, PUBLIC_WSS_PORT } from '$env/static/public';
	import deckconfig from '/src/deckconfig.toml';

	// 起動ロックの参照を作成
	let つけっぱ: WakeLockSentinel | null = null;
	let つけっぱ状態 = false;
	let 音量 = 0.1;

	// 状態管理
	let 音量調整モード: string;
	$: isTotalMixFX = 音量調整モード === 'totalmixfx';

	onMount(() => {
		音量調整モード = localStorage.getItem('volume_mode') ?? deckconfig.volume.mode_options[0];
		音量WebSocket初期化();
		console.log(deckconfig);
	});

	//---------------------------------------------
	// screen wake lock をリクエストするための関数
	//---------------------------------------------
	async function つけっぱ切り替え() {
		if (!つけっぱ) {
			// ブラウザは Screen Wake Lock を拒否することがあるので、
			// try...catch を使い拒否された場合の処理も記述する
			try {
				// screen wake lock をリクエストする
				つけっぱ = await navigator.wakeLock.request('screen');
				つけっぱ状態 = true;
				つけっぱ.addEventListener('release', () => {
					つけっぱ状態 = false;
				});
			} catch (err) {
				if (err instanceof Error) {
					console.error(`${err.name}, ${err.message}`);
					alert(`${err.name}, ${err.message}`);
				}
			}
		} else {
			つけっぱ?.release();
			つけっぱ = null;
		}
	}

	async function post(url: string, data: any): Promise<any> {
		const res = await fetch(url, {
			method: 'POST',
			body: JSON.stringify(data)
		});
		if (!res.ok) {
			const json = await res.json();
			alert(JSON.stringify(json));
			throw new Error('Network response was not ok.');
		}
		return res.json();
	}

	async function apiRequest(key: string, method = 'POST', body = {}): Promise<any> {
		const res = await fetch(`/api/${key}`, { method, body: JSON.stringify(body)});
		if (!res.ok) {
			const json = await res.json();
			alert(JSON.stringify(json));
			throw new Error('Network response was not ok.');
		}
		return res.json();
	}

	async function 音量変更(e: Event) {
		const volstr = (e.target as HTMLInputElement).value;
		const vol = parseFloat(volstr);
		let api;
		if (isTotalMixFX) {
			api = 'api/media/totalmixfx/volume';
		} else {
			api = 'api/media/volume';
		}
		const res = await fetch(api, {
			method: 'POST',
			body: JSON.stringify({ volume: vol })
		});
		if (!res.ok) {
			const json = await res.json();
			alert(JSON.stringify(json));
			throw new Error('Network response was not ok.');
		}
	}

	async function 音量WebSocket初期化() {
		const sock = new WebSocket(`wss://${PUBLIC_DOMAIN}:${PUBLIC_WSS_PORT}`);
		sock.addEventListener('message', (e) => {
			const data = JSON.parse(e.data);
			if (data.msg && data.msg === '/1/mastervolume') {
				if (!isTotalMixFX) return;
				const vol = data.arg;
				if (!vol) return;
				if (typeof vol !== 'number') return;
				音量 = vol;
			}
		});
	}

	function 音量モード変更(e: Event) {
		const mode = (e.target as HTMLOptionElement).value;
		console.log(mode);
		localStorage.setItem('volume_mode', mode);
		音量調整モード = mode;
	}
</script>

<main class="container">
	<section class="section">
		<h1 class="title">常時起動設定 🌞</h1>
		<button class="box button is-light is-fullwidth" on:click={つけっぱ切り替え}>
			常時起動を切り替え
		</button>
		<div class="box">
			常時起動モード: {つけっぱ状態 ? '😎 有効' : '😪 無効'}
		</div>
	</section>

	<section class="section">
		<h1 class="title">メディア操作 🎵</h1>
		<div class="buttons has-addons is-centered">
			<button class="button is-large" on:click={() => apiRequest('media/prev-track')}> ⏮️ </button>
			<button class="button is-large" on:click={() => apiRequest('media/play-pause')}> ⏯️ </button>
			<button class="button is-large" on:click={() => apiRequest('media/next-track')}> ⏭️ </button>
			<button class="button is-large" on:click={() => apiRequest('media/mute')}> 🔇 </button>
		</div>
		<div class="select">
			<select on:change={音量モード変更}>
				{#each deckconfig.volume.mode_options as mode}
					<option value={mode}>
						{mode}
					</option>
				{/each}
			</select>
		</div>
		<input
			class="slider is-fullwidth is-circle"
			step="0.005"
			min="0"
			max="1"
			value={音量}
			type="range"
			on:input={音量変更}
		/>
	</section>

	<section class="section">
		<h1 class="title">絵文字 😊</h1>
		<div class="buttons has-addons is-centered">
			{#each deckconfig.emoji as emoji}
				<button
					class="button is-large"
					on:click={() => apiRequest('emoji', 'POST', { emoji: emoji})}
				>
					{emoji}
				</button>
			{/each}
		</div>
	</section>

	<section class="section">
		<h1 class="title">デスクトップ 🖥️</h1>
		<div class="buttons has-addons is-centered">
			{#each deckconfig.desktop.switch as target}
				<button
					class="button is-large"
					on:click={() => apiRequest(`desktop/switch/${target.name}`)}
				>
					{target.body}
				</button>
			{/each}
		</div>
		<div class="buttons is-centered">
			<button class="button" on:click={() => apiRequest('desktop/pin-active')}>
				📌 Pin Active
			</button>
			<button class="button" on:click={() => apiRequest('desktop/unpin-active')}>
				✂️ Unpin Active
			</button>
		</div>
	</section>

	<section class="section">
		<h1 class="title">アプリ 📱</h1>
		<div class="buttons has-addons is-centered">
			{#each deckconfig.app as target}
				<button
					class="button is-large"
					on:click={() => apiRequest(`app/${target.mode}/${target.name}`)}
				>
					{target.body}
				</button>
			{/each}
		</div>
	</section>

	<section class="section">
		<h1 class="title">システム🛠️</h1>
		<div class="buttons has-addons is-centered">
			<button class="button is-large" on:click={() => apiRequest('system/power/sleep')}>
				ぽやしみ～😴
			</button>
			<button class="button is-large" on:click={() => apiRequest('system/power/shutdown')}>
				シャットダウン🌉
			</button>
			<button class="button is-large" on:click={() => apiRequest('system/power/restart')}>
				再起動🌄
			</button>
			<button class="button is-large" on:click={() => apiRequest('system/display/on')}>
				画面ON🙂
			</button>
			<button class="button is-large" on:click={() => apiRequest('system/display/off')}>
				画面OFF😌
			</button>
		</div>
	</section>
</main>

<!-- <BgCanvas /> -->

<style lang="scss">
	main {
		max-width: 100vw;
	}
</style>
