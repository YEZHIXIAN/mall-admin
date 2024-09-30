<template>
  <div>
    <el-tree
      :data="categories"
      :props="defaultProps"
      :expand-on-click-node="false"
      show-checkbox node-key="catId"
      :default-expanded-keys="expandedKey"
    >

      <span class="custom-tree-node" slot-scope="{ node, data }">
        <span>{{ node.label }}</span>
        <span>
          <el-button v-if="node.level <= 2" type="text" size="mini" @click="append(data)">
            Append
          </el-button>
          <el-button v-if="node.childNodes.length === 0" type="text" size="mini" @click="remove(node, data)">
            Delete
          </el-button>
          <el-button type="text" size="mini" @click="edit(data)">
            Edit
          </el-button>
        </span>
      </span>
    </el-tree>

    <el-dialog :title="title" :visible.sync="dialogFormVisible" width="30%">
      <el-form :model="category">
        <el-form-item label="分类名称">
          <el-input v-model="category.name" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="图标">
          <el-input v-model="category.icon" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="计量单位">
          <el-input v-model="category.productUnit" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitData">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      title: '',
      category: {
        name: '',
        parentCid: 0,
        catLevel: 0,
        showStatus: 1,
        sort: 0,
        catId: null,
        productUnit: '',
        icon: ''
      },
      dialogFormVisible: false,
      categories: [],
      expandedKey: [],
      defaultProps: {
        children: 'subcategories',
        label: 'name'
      }
    }
  },
  methods: {
    getMenus() {
      this.$http({
        url: this.$http.adornUrl('/product/category/list/tree'),
        method: 'get'
      }).then(({data}) => {
        this.categories = data.data
        console.log('successfully got data', data)
      }).catch(error => {
        console.error('Error fetching data:', error)
      })
    },
    submitData() {
      if (this.dialogType === 'add') {
        this.addCategory()
      }
      if (this.dialogType === 'edit') {
        this.editCategory()
      }
    },
    edit(data) {
      console.log('要修改的数据', data)
      this.dialogType = 'edit'
      this.title = '修改分类'
      this.dialogFormVisible = true

      this.$http({
        url: this.$http.adornUrl(`/product/category/info/${data.catId}`),
        method: 'get'
      }).then(({data}) => {
        console.log('要回显的数据', data)
        this.category.name = data.category.name
        this.category.catId = data.category.catId
        this.category.icon = data.category.icon
        this.category.productUnit = data.category.productUnit
        this.category.parentCid = data.category.parentCid
        this.category.catLevel = data.category.catLevel
        this.category.showStatus = data.category.showStatus
        this.category.sort = data.category.sort
      })
    },
    editCategory() {
      var {catId, name, icon, productUnit} = this.category
      console.log('提交的修改数据', {catId, name, icon, productUnit})
      this.$http({
        url: this.$http.adornUrl(`/product/category/update`),
        method: 'post',
        data: this.$http.adornData({catId, name, icon, productUnit}, false)
      }).then(({data}) => {
        this.$message({
          message: '修改成功',
          type: 'success'
        })
        this.dialogFormVisible = false
        this.getMenus()
        this.expandedKey = [this.category.parentCid]
      })
    },
    append(data) {
      console.log('append', data)
      this.title = '修改分类'
      this.dialogFormVisible = true
      this.category.parentCid = data.catId
      this.category.catLevel = data.catLevel * 1 + 1
    },
    addCategory() {
      console.log('提交的三级分类数据', this.category)
      this.$http({
        url: this.$http.adornUrl(`/product/category/save`),
        method: 'post',
        data: this.$http.adornData(this.category, false)
      }).then(({data}) => {
        this.$message({
          message: 'successfully save',
          type: 'success'
        })
        this.dialogFormVisible = false
        this.getMenus()
        this.expandedKey = [this.category.parentCid]
      })
    },
    remove(node, data) {
      var ids = [data.catId]
      this.$confirm(`是否删除[${data.name}?]`, 'notification', {
        confirmButtonText: 'confirm',
        cancelButtonText: 'cancel',
        type: 'warning'
      }).then(() => {
        this.$http({
          url: this.$http.adornUrl(`/product/category/delete`),
          method: 'post',
          data: this.$http.adornData(ids, false)
        }).then(({data}) => {
          this.$message({
            message: 'success',
            type: 'success'
          })
          console.log('successfully delete')
          this.getMenus()
          this.expandedKey = [node.parent.data.catId]
        })
      })
      console.log('delete', node, data)
    }
  },
  created() {
    this.getMenus()
  }
}
</script>
