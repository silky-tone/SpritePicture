<template>
  <div class="var-drag-box var-card" :class="{'is-drag': data.drag}" @dragover="onDragover" @dragleave="onDragleave" @drop="onDrop">
    <el-button type="primary" @click.stop="onGetFiles">选择图片</el-button>
    <el-text>将图片拖拽到此处，或者点击按钮选择图片。</el-text>
  </div>
</template>

<script lang="ts">export default {name: 'AppDrag'};</script>
<script setup lang="ts">
import { getDragFile, getFile } from '../../utils';
import { reactive } from 'vue';

const data = reactive({drag: false});

function onDragover(event: DragEvent) {
  event.stopPropagation();
  event.preventDefault();
  data.drag = true;
}

function onDragleave() {
  data.drag = false;
}

const emits = defineEmits(['drop']);

function onGetFiles() {
  getFile(['jpg', 'png', 'jpeg', 'webp'], true).then(files => {
    emits('drop', files);
  });
}

function onDrop(event: DragEvent) {
  emits('drop', getDragFile(event as any));
  data.drag = false;
}
</script>
