<template>
  <div class="var-style" ref="styleRef">
    <div>.{{ props.name }} {background: url('sprite.png') no-repeat top left;}</div>
    <template v-for="item of props.data">
      <div>{{ handlerStyle(item) }}</div>
    </template>
  </div>
</template>

<script lang="ts">export default {name: 'AppStyle'};</script>
<script setup lang="ts">
import { ref, toValue } from 'vue';

interface Props {
  unit: 'px' | 'rem';
  convertUnit: number;
  data: any;
  name: string;
}

const styleRef = ref();
const props = withDefaults(defineProps<Props>(), {
  unit: () => 'px',
  data: () => ([]),
  name: () => 'sprite',
  convertUnit: () => 1,
});

function handlerSize(size: number) {
  if (size === 0) return '0';
  return props.unit === 'rem' ? `${size * props.convertUnit}${props.unit}` : `${size}${props.unit}`;
}

function handlerStyle(item: any) {
  return `.${props.name}.${item.name} {width: ${handlerSize(item.width)}; height: ${handlerSize(item.height)}; perspective-origin: ${handlerSize(-item.left)} ${handlerSize(-item.top)};}`;
}

function download() {
  const text = toValue(styleRef).innerText;
  const blob = new Blob([text], {type: 'text/plain'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'sprite.css';
  a.click();
  URL.revokeObjectURL(url);
  a.remove();
}

defineExpose({download});
</script>
