<template>
  <div class="var-style" ref="styleRef">
    <div>.{{ props.name }} {background: url('{{ props.name }}.png') no-repeat top left; background-size: {{ handlerSize(props.width) }} {{ handlerSize(props.height) }}; }</div>
    <template v-for="item of props.data">
      <div>{{ handlerStyle(item) }}</div>
    </template>
  </div>
</template>

<script lang="ts">export default {name: 'AppStyle'};</script>
<script setup lang="ts">
import { ref, toValue } from 'vue';

interface Props {
  data: any;
  name: string;
  width: number;
  height: number;
  unit: 'px' | 'rem';
  convertUnit: number;
}

const styleRef = ref();
const props = withDefaults(defineProps<Props>(), {
  width: () => 0,
  height: () => 0,
  unit: () => 'px',
  data: () => ([]),
  name: () => 'sprite',
  convertUnit: () => 1,
});

function handlerSize(size: number) {
  if (size === 0) return '0';
  return props.unit === 'rem' ? `${size / props.convertUnit}${props.unit}` : `${size}${props.unit}`;
}

function handlerStyle(item: any) {
  return `.${props.name}.${item.name} {width: ${handlerSize(item.width)}; height: ${handlerSize(item.height)}; background-position: ${handlerSize(-item.left)} ${handlerSize(-item.top)};}`;
}

function download() {
  const text = toValue(styleRef).innerText;
  const blob = new Blob([text], {type: 'text/plain'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${props.name}.css`;
  a.click();
  URL.revokeObjectURL(url);
  a.remove();
}

defineExpose({download});
</script>
