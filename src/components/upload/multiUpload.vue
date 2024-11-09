<template>
  <div>
    <el-upload
      :action="uploadUrl"
      :data="dataObj"
      list-type="picture-card"
      :multiple="true"
      :show-file-list="true"
      :file-list="fileList"
      :before-upload="beforeUpload"
      :on-remove="handleRemove"
      :on-success="handleUploadSuccess"
      :on-preview="handlePreview"
    >
      <i class="el-icon-plus"></i>
    </el-upload>

    <el-input
      placeholder="输入文件路径或网络URL"
      v-model="filePathOrUrl"
    ></el-input>

    <el-dialog :visible.sync="dialogVisible">
      <img width="100%" :src="dialogImageUrl" alt/>
    </el-dialog>
  </div>
</template>
<script>
export default {
  name: 'multiUpload',
  props: {
    value: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      uploadUrl: this.$http.adornUrl('/third-party/s3/upload'), // Backend URL for file upload
      filePathOrUrl: '',
      dataObj: {},
      dialogVisible: false,
      dialogImageUrl: null,
      fileList: [] // Store the uploaded files here for preview
    }
  },
  watch: {
    value: {
      immediate: true,
      handler(newValue) {
        // Sync the fileList with the value prop to ensure uploaded images are shown
        this.fileList = newValue.map(url => ({
          name: url.substring(url.lastIndexOf('/') + 1), // Extract file name from URL
          url: url
        }));
      }
    }
  },
  methods: {
    emitInput(val) {
      this.$emit('input', val);
    },
    handleRemove(file, fileList) {
      // Remove the file from the list and emit the updated list
      this.fileList = fileList;
      const urls = this.fileList.map(file => file.url);
      this.emitInput(urls);
    },
    handlePreview(file) {
      this.dialogImageUrl = file.url;
      this.dialogVisible = true;
    },
    beforeUpload(file) {
      // If you need to process anything before upload, such as validating the file
      return new Promise((resolve, reject) => {
        if (file.size > 5 * 1024 * 1024) {
          this.$message.error('File size exceeds 5MB');
          reject(false);
        } else {
          resolve(true);
        }
      });
    },
    handleUploadSuccess(res, file) {
      // Assuming the response contains the file URL from the backend
      this.fileList.push({
        name: file.name,
        url: res // The file URL returned by the backend
      });
      const urls = this.fileList.map(file => file.url);
      this.emitInput(urls); // Emit the full list of URLs to parent component
    }
  }
};
</script>
