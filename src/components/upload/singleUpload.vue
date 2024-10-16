<template>
  <div>
    <el-upload
      :action="uploadUrl"
      :data="dataObj"
      list-type="picture"
      :multiple="false"
      :show-file-list="showFileList"
      :file-list="fileList"
      :before-upload="beforeUpload"
      :on-remove="handleRemove"
      :on-success="handleUploadSuccess"
      :on-preview="handlePreview"
    >
      <el-button size="small" type="primary">点击上传</el-button>
      <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过5MB</div>
    </el-upload>
    <el-dialog :visible.sync="dialogVisible">
      <img width="100%" :src="fileList[0].url" alt/>
    </el-dialog>
  </div>
</template>

<script>

export default {
  name: 'singleUpload',
  props: {
    value: String
  },
  computed: {
    imageUrl() {
      return this.value
    },
    imageName() {
      if (this.value != null && this.value !== '') {
        return this.value.substring(this.value.lastIndexOf('/') + 1)
      } else {
        return null
      }
    },
    fileList() {
      return [
        {
          name: this.imageName,
          url: this.imageUrl
        }
      ]
    },
    showFileList: {
      get: function () {
        return this.value !== null && this.value !== '' && this.value !== undefined
      },
      set: function (newValue) {
      }
    }
  },
  data() {
    return {
      uploadUrl: this.$http.adornUrl('/third-party/s3/upload'), // Use the backend URL for file upload
      dataObj: {},
      dialogVisible: false
    }
  },
  methods: {
    emitInput(val) {
      this.$emit('input', val)
    },
    handleRemove(file, fileList) {
      this.emitInput('')
    },
    handlePreview(file) {
      this.dialogVisible = true
    },
    beforeUpload(file) {
      // If you need to process anything before upload, such as validating the file
      return new Promise((resolve, reject) => {
        if (file.size > 5 * 1024 * 1024) {
          this.$message.error('File size exceeds 5MB')
          reject(false)
        } else {
          resolve(true)
        }
      })
    },
    handleUploadSuccess(res, file) {
      // Assuming the response contains the file URL from the backend
      this.showFileList = true
      this.fileList.pop()
      this.fileList.push({
        name: file.name,
        url: res // The file URL returned by the backend
      })
      this.emitInput(this.fileList) // Emit the file URL to parent component
    }
  }
}
</script>

<style scoped>
.image-preview {
  margin-top: 20px;
}

.upload-demo .el-upload {
  display: inline-block;
  margin-right: 10px;
}
</style>
