<template>
  <div>
    <app-drag @drop="onDrop" />
  </div>
  <div class="var-files var-card">
    <template v-if="data.files.length">
      <el-table :data="data.files" height="400px" stripe>
        <el-table-column label="索引" width="60" align="center">
          <template #default="{$index}">{{ $index + 1 }}</template>
        </el-table-column>
        <el-table-column label="图片" width="160" align="center">
          <template #default="{$index}">
            <el-image style="width: 100%; height: 50px" fit="contain" :src="getImage($index)" preview-teleported :preview-src-list="[getImage($index)]" />
          </template>
        </el-table-column>
        <el-table-column prop="name" label="文件名" align="left" />
        <el-table-column prop="type" label="文件类型" width="100" align="center" />
        <el-table-column prop="size" label="文件大小(kb)" width="120" align="center" />
        <el-table-column label="操作" width="100" align="center">
          <template #default="{$index}">
            <el-button type="danger" @click.stop="onRemoveFiles($index)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </template>
    <el-empty v-else :image-size="100" description="暂无数据，请上传图片文件" />
  </div>
  <div class="var-form-box var-card">
    <app-form v-model="data.form">
      <el-col :span="12">
        <el-form-item label="统一名称" prop="name">
          <el-input v-model="data.form.name" placeholder="请输入统一名称" />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-button @click="onPacking" type="primary">生成精灵图</el-button>
        <el-button @click="onCancel" type="warning">清空</el-button>
        <el-button @click="onDownload" type="success" v-if="data.packingInfo">下载</el-button>
      </el-col>
    </app-form>
  </div>
  <div class="var-content var-card" v-show="data.packingInfo">
    <el-tabs model-value="canvas">
      <el-tab-pane label="精灵图" name="canvas">
        <app-canvas ref="canvasRef" :type="data.form.outType" :name="data.form.name" :color="data.form.color" @size="onCanvasSize" />
      </el-tab-pane>
      <el-tab-pane label="样式" name="css">
        <app-style
          ref="styleRef"
          :name="data.form.name"
          :unit="data.form.unit"
          :data="data.packingInfo"
          :width="data.canvasSize.width"
          :height="data.canvasSize.height"
          :convert-unit="data.form.convertUnit"
        />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, toValue } from 'vue';
import { imagesPacking } from '../utils';
import { ElMessage } from 'element-plus';

import AppForm from './src/form.vue';
import AppDrag from './src/drag.vue';
import AppStyle from './src/style.vue';
import AppCanvas from './src/canvas.vue';

import 'element-plus/theme-chalk/el-message.css';

const styleRef = ref();
const canvasRef = ref();
const data = reactive<Record<string, any>>({
  form: {
    unit: 'px',
    spacing: 2,
    outType: 'png',
    name: 'sprite',
    maxWidth: 2000,
    convertUnit: 1,
    color: 'rgba(0, 0, 0, 0)',
  },
  files: [],
  fileImageMap: {},
  packingInfo: null,
  canvasSize: { width: 0, height: 0 },
});

function handFileName(file: File) {
  return file.name.replace(/\.[^.]+$/, '');
}

function getFilesName(files: File[]) {
  return files.map(handFileName);
}

function onDrop(files: File[]) {
  // 过滤非 jpg, png, jpeg, webp 的文件
  const filterFiles = files.filter(file => /\.(jpg|png|jpeg|webp)$/.test(file.name));
  //
  const fileName = getFilesName(filterFiles);
  for (let i = (data.files.length - 1); i >= 0; i -= 1) {
    if (fileName.includes(handFileName(data.files[i]))) {
      data.files.splice(i, 1);
    }
  }
  data.files = data.files.concat(filterFiles);
}

function getImage(index: number) {
  const file = data.files[index];
  const fileName = handFileName(file);
  if (!data.fileImageMap[fileName]) {
    data.fileImageMap[fileName] = URL.createObjectURL(file);
  }
  return data.fileImageMap[fileName];
}

function onRemoveFiles(index: number) {
  const keys = handFileName(data.files[index]);
  const url = data.fileImageMap[keys];
  if (url) {
    URL.revokeObjectURL(url);
    delete data.fileImageMap[keys];
  }
  data.files.splice(index, 1);
}

function onPacking() {
  const imagesMap = Object.keys(data.fileImageMap).reduce(function(prev: Record<string, string>, name: string) {
    return Object.assign(prev, { [data.fileImageMap[name]]: name });
  }, {});
  const images = Object.keys(imagesMap);
  if (!images.length) return ElMessage.warning('请先选择图片');
  console.log(data);
  imagesPacking(images, data.form).then(res => {
    res = res.map(item => {
      return Object.assign(item, { name: imagesMap[item.url] });
    });
    toValue(canvasRef)?.init(res);
    data.packingInfo = res;
  });
}

function onCancel() {
  data.files = [];
  data.packingInfo = null;
  for (const name of Object.keys(data.fileImageMap)) {
    URL.revokeObjectURL(data.fileImageMap[name]);
  }
  data.fileImageMap = {};
}

function onDownload() {
  if (!data.form.name) return ElMessage.warning('请先填写统一名称');
  toValue(styleRef).download();
  toValue(canvasRef).download();
}

function onCanvasSize(size: { width: number, height: number }) {
  data.canvasSize = size;
}
</script>
