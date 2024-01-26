<script lang="ts">
	import fragShader from '$lib/shaders/bg_bubbles.frag?raw';
	import { onMount } from 'svelte';

	let canvas: HTMLCanvasElement | null;
	let glContext: WebGL2RenderingContext | null;
	let shaderProgram: WebGLProgram | null;

	onMount(async () => {
		if (!canvas) {
			console.error('Canvas is not found.');
			return;
		}

		glContext = canvas.getContext('webgl2');
		if (!glContext) {
			console.error('WebGL2 is not supported.');
			return;
		}

		initCanvas(glContext);

		// レンダリングループ
		const render = () => {
			if (!canvas || !glContext || !shaderProgram) return;
			draw(canvas, glContext, shaderProgram);
			requestAnimationFrame(render);
		};
		requestAnimationFrame(render);

        resizeCanvas(glContext);
	});

	function initCanvas(gl: WebGL2RenderingContext) {
		// 頂点シェーダのソースコード
		const vertexShaderSource = `#version 300 es
            in vec2 vertexPosition;
            in vec4 color;
            out vec4 vColor;
            out vec2 fragCoord;

            void main() {
                vColor = color;
                fragCoord = vertexPosition;
                gl_Position = vec4(vertexPosition, 0.0, 1.0);
            }
        `;

		// フラグメントシェーダのソースコード
		const fragmentShaderSource = fragShader;

		// 頂点シェーダをコンパイル
		const vertexShader = gl.createShader(gl.VERTEX_SHADER);
		if (!vertexShader) return;
		gl.shaderSource(vertexShader, vertexShaderSource);
		gl.compileShader(vertexShader);

		// フラグメントシェーダをコンパイル
		const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
		if (!fragmentShader) return;
		gl.shaderSource(fragmentShader, fragmentShaderSource);
		gl.compileShader(fragmentShader);

		// プログラムオブジェクトを作成
		shaderProgram = gl.createProgram();
		if (!shaderProgram) return;

		// シェーダをプログラムにアタッチ
		gl.attachShader(shaderProgram, vertexShader);
		gl.attachShader(shaderProgram, fragmentShader);
		gl.linkProgram(shaderProgram);
		gl.useProgram(shaderProgram);

		// 頂点座標を指定
		const vertices = new Float32Array([-1.0, -1.0, 1.0, -1.0, -1.0, 1.0, 1.0, 1.0]);

		const vertexBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

		const positionLocation = gl.getAttribLocation(shaderProgram, 'vertexPosition');
		gl.enableVertexAttribArray(positionLocation);
		gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
	}

	function draw(canvas: HTMLCanvasElement, gl: WebGL2RenderingContext, program: WebGLProgram) {
		gl.clearColor(0.0, 0.0, 0.0, 0.0);
		gl.clear(gl.COLOR_BUFFER_BIT);

		const timeLocation = gl.getUniformLocation(program, 'iTime');
		gl.uniform1f(timeLocation, performance.now() / 1000);
		const aspectLocation = gl.getUniformLocation(program, 'iAspect');
		gl.uniform1f(aspectLocation, canvas.width / canvas.height);

		gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
	}

	function resizeCanvas(gl: WebGL2RenderingContext) {
		if (!canvas) return;
		canvas.width = window.innerWidth * window.devicePixelRatio;
		canvas.height = window.innerHeight * window.devicePixelRatio;
		gl.viewport(0, 0, canvas.width, canvas.height);
	}
</script>

<canvas bind:this={canvas}></canvas>
<svelte:window
	on:resize={() => {
		if (glContext) resizeCanvas(glContext);
	}}
/>

<style>
	canvas {
		position: fixed;
		top: 0;
		left: 0;
		width: 100vw;
		height: 100vh;
		z-index: -100;
	}
</style>
