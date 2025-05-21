<template>
  <canvas class="var-canvas" ref="canvasRef" style="width: 100%;"></canvas>
</template>

<script lang="ts">export default {name: 'AppCanvas'};</script>
<script setup lang="ts">
import type { ImageInfo } from '../../utils';
import { ref, toValue } from 'vue';

interface Props {
  color?: string;
  type?: string;
}

const props = withDefaults(defineProps<Props>(), {
  type: () => 'png',
});

const canvasRef = ref();

function init(imagesInfo: Array<ImageInfo>) {
  const canvas = toValue(canvasRef)!;
  const canvasWidth = Math.max(...imagesInfo.map(img => img.left + img.width));
  const canvasHeight = Math.max(...imagesInfo.map(img => img.top + img.height));
  //
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  const ctx = canvas.getContext('2d')!;

  // 清空画布
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);

  // 绘画背景色
  if (props.color) {
    ctx.fillStyle = props.color;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
  }
  //
  for (const image of imagesInfo) {
    ctx.drawImage(image.img, image.left, image.top);
  }
}

function download() {
  const url = toValue(canvasRef).toDataURL(`image/${props.type}`);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'sprite.png';
  a.click();
  URL.revokeObjectURL(url);
  a.remove();
}

defineExpose({init, download});
</script>
