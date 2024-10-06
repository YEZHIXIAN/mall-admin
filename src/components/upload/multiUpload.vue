<template>
  <div>
    <el-upload
      :action="actionUrl"
      :data="dataObj"
      :file-list="fileList"
      :before-upload="beforeUpload"
      :on-remove="handleRemove"
      :on-success="handleUploadSuccess"
      :on-preview="handlePreview"
      :limit="maxCount"
      :on-exceed="handleExceed"
      :show-file-list="showFile"
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
import axios from 'axios'

export default {
  name: 'multiUpload',
  props: {
    value: Array,
    maxCount: {
      type: Number,
      default: 30
    },
    listType: {
      type: String,
      default: 'picture-card'
    },
    showFile: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      actionUrl: '',  // This will be dynamically set based on the pre-signed URL
      filePathOrUrl: '',
      dataObj: {},
      dialogVisible: false,
      dialogImageUrl: null
    }
  },
  computed: {
    fileList() {
      let fileList = []
      for (let i = 0; i < this.value.length; i++) {
        fileList.push({ url: this.value[i] })
      }
      return fileList
    }
  },
  methods: {
    emitInput(fileList) {
      let value = []
      for (let i = 0; i < fileList.length; i++) {
        value.push(fileList[i].url)
      }
      this.$emit('input', value)
    },
    handleRemove(file, fileList) {
      this.emitInput(fileList)
    },
    handlePreview(file) {
      this.dialogVisible = true
      this.dialogImageUrl = file.url
    },
    async beforeUpload(file) {
      let _self = this
      return new Promise(async (resolve, reject) => {
        try {
          // Use adornUrl to send request to backend to fetch presigned URL
          const {data} = await axios.get(this.$http.adornUrl('/third-party/s3/upload'), {
            params: {
              fileName: file.name
            }
          });

          // Set pre-signed URL for uploading the file directly to S3
          _self.actionUrl = data.url

          resolve(true)  // Proceed with the upload
        } catch (error) {
          console.error('Error fetching pre-signed URL:', error)
          reject(false)
        }
      })
    },
    handleUploadSuccess(response, file) {
      // Push the new file URL to the file list after upload is successful
      this.fileList.push({
        name: file.name,
        url: this.actionUrl
      })
      this.emitInput(this.fileList)
    },
    handleExceed(files, fileList) {
      this.$message({
        message: `最多只能上传 ${this.maxCount} 个文件`,
        type: 'warning',
        duration: 1000
      })
    }
  }
}
</script>
