<template>
  <el-form :model="values" label-position="left" label-width="70px">
    <el-row :gutter="20">
      <el-col :span="8">
        <el-form-item label="排列间距" prop="spacing">
          <el-input-number :min="0" controls-position="right" v-model="values.spacing"></el-input-number>
        </el-form-item>
      </el-col>
      <el-col :span="8">
        <el-form-item label="最大宽度" prop="maxWidth">
          <el-input-number :min="0" controls-position="right" v-model="values.maxWidth"></el-input-number>
        </el-form-item>
      </el-col>
      <el-col :span="8">
        <el-form-item label="大小转换" prop="convertUnit">
          <el-input-number :min="1" controls-position="right" v-model="values.convertUnit"></el-input-number>
        </el-form-item>
      </el-col>
      <el-col :span="8">
        <el-form-item label="样式单位" prop="unit">
          <el-segmented :options="['px', 'rem']" v-model="values.unit"></el-segmented>
        </el-form-item>
      </el-col>
      <el-col :span="8">
        <el-form-item label="输出格式" prop="outType">
          <el-segmented :options="['jpg', 'png']" v-model="values.outType" @change="onOutTypeChange"></el-segmented>
        </el-form-item>
      </el-col>
      <el-col :span="8">
        <el-form-item label="背景颜色" prop="color">
          <color-picker picker-type="chrome" format="rgb" v-model:pureColor="values.color"></color-picker>
        </el-form-item>
      </el-col>
      <slot/>
    </el-row>
  </el-form>
</template>

<script lang="ts">export default {name: 'AppForm'};</script>
<script setup lang="ts">
import { ColorPicker } from 'vue3-colorpicker';
import { reactive, watch } from 'vue';
//
import 'vue3-colorpicker/style.css';

const props = withDefaults(defineProps<{ modelValue: Record<string, any>; }>(), {
  modelValue: () => ({
    spacing: 0,
    maxWidth: 0,
    outType: 'jpg',
    unit: 'px',
    color: '',
    convertUnit: 1,
  }),
});

const values = reactive(props.modelValue);

const emits = defineEmits(['update:modelValue']);

watch(values, () => emits('update:modelValue', values));

function onOutTypeChange(value: string) {
  console.log(value);
  if (value === 'jpg') {
    values.color = 'rgb(255, 255, 255)';
  } else {
    values.color = 'rgba(0, 0, 0, 0)';
  }
}
</script>
