<template>
  <div>
    <el-switch v-model="draggable" active-text="enable dragging" inactive-text="disable dragging"></el-switch>
    <el-button v-if="draggable" @click="batchSave">save batch</el-button>
    <el-button type="danger" @click="batchDelete">delete batch</el-button>
    <el-tree
      :data="categories"
      :props="defaultProps"
      :expand-on-click-node="false"
      :show-checkbox="false"
      node-key="catId"
      :default-expanded-keys="expandedKey"
      :draggable="draggable"
      :allow-drop="allowDrop"
      @node-drop="handleDrop"
      ref="menuTree"
    >

      <span class="custom-tree-node" slot-scope="{ node, data }">
        <input type="checkbox" :checked="node.checked" @change="toggleCheck(node)">
        <span>{{ node.label }}</span>
        <span>
          <el-button v-if="node.level <= 2" type="text" size="mini" @click="append(data)">Append</el-button>
          <el-button v-if="node.childNodes.length === 0" type="text" size="mini" @click="remove(node, data)">Delete</el-button>
          <el-button type="text" size="mini" @click="edit(data)">Edit</el-button>
        </span>
      </span>
    </el-tree>

    <el-dialog
      :title="title"
      :visible.sync="dialogFormVisible"
      width="30%"
      :close-on-click-modal="false"
    >

      <el-form :model="category">
        <el-form-item label="category name">
          <el-input v-model="category.name" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="icon">
          <el-input v-model="category.icon" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="unit">
          <el-input v-model="category.productUnit" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">cancel</el-button>
        <el-button type="primary" @click="submitData">confirm</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      checkedNodes: [],
      pCid: [],
      draggable: false,
      updateNodes: [],
      maxLevel: 3,
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
        console.error('failed to get data', error)
      })
    },
    toggleCheck(node) {
      // Toggle the checked state
      node.checked = !node.checked
      if (node.checked) {
        this.checkedNodes.push(node)
      } else {
        this.checkedNodes = this.checkedNodes.filter(n => n.catId !== node.catId)
      }
      console.log(`Node ${node.label} checked state: ${node.checked}`)
    },
    batchDelete() {
      let catIds = []
      let checkedNodes = this.checkedNodes
      console.log('checked nodes', checkedNodes.data)
      for (let i = 0; i < checkedNodes.length; i++) {
        catIds.push(checkedNodes[i].data.catId)
      }
      this.$confirm(`confirm to delete?`, 'warning', {
        confirmButtonText: 'confirm',
        cancelButtonText: 'cancel',
        type: 'warning'
      }).then(() => {
        this.$http({
          url: this.$http.adornUrl(`/product/category/delete`),
          method: 'post',
          data: this.$http.adornData(catIds, false)
        })
        console.log('successfully delete', catIds)
      }).then(() => {
        this.$message({
          message: 'successfully deleted',
          type: 'success'
        })
        this.getMenus()
        this.expandedKey = [checkedNodes[0].data.parentCid]
      })
    },
    batchSave() {
      this.$http({
        url: this.$http.adornUrl(`/product/category/update/sort`),
        method: 'post',
        data: this.updateNodes
      }).then(({data}) => {
        this.$message({
          message: 'successfully edited data',
          type: 'success'
        })
        this.getMenus()
        this.expandedKey = [this.pCid]
        this.updateNodes = []
        this.maxLevel = 0
      })
    },
    allowDrop(draggingNode, dropNode, type) {
      this.countNodeLevel(draggingNode)
      let depth = Math.abs(this.maxLevel - draggingNode.data.catLevel) + 1
      console.log('depth', depth)
      if (type === 'inner') {
        return depth + dropNode.data.catLevel <= 3
      }
      return (depth + dropNode.parent.data.catLevel) <= 3
    },
    countNodeLevel(node) {
      if (node.childNodes != null && node.childNodes.length > 0) {
        for (let i = 0; i < node.childNodes.length; i++) {
          if (node.childNodes[i].catLevel > this.maxLevel) {
            this.maxLevel = node.childNodes[i].level
          }
          this.countNodeLevel(node.childNodes[i])
        }
      }
    },
    handleDrop(draggingNode, dropNode, dropType) {
      let pCid = 0
      let siblings = null
      if (dropType === 'before' || dropType === 'after') {
        pCid = dropNode.data.parent.catId === undefined ? 0 : dropNode.data.parent.catId
        siblings = dropNode.parent.childNodes
      } else {
        pCid = dropNode.data.catId
        siblings = dropNode.childNodes
      }

      this.pCid = pCid

      for (let i = 0; i < siblings.length; i++) {
        if (siblings[i].data.catId === draggingNode.data.catId) {
          let catLevel = draggingNode.level
          if (siblings[i].level !== draggingNode.level) {
            if (dropType === 'before' || dropType === 'after') {
              catLevel = siblings[i].level
              this.updateChildNodeLevel(siblings[i])
            }
          }
          this.updateNodes.push({catId: siblings[i].data.catId, sort: i, parentCid: pCid, catLevel: catLevel})
        } else {
          this.updateNodes.push({catId: siblings[i].data.catId, sort: i})
        }

        console.log('updateNodes', this.updateNodes)
      }
    },
    updateChildNodeLevel(node) {
      if (node.childNodes.length <= 0) return
      for (let i = 0; i < node.childNodes.length; i++) {
        let cNode = node.childNodes[i].data
        this.updateNodes.push({catId: cNode.data.catId, catLevel: node.childNodes[i].level})
        this.updateChildNodeLevel(node.childNodes[i])
      }
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
      console.log('data to be edited', data)
      this.dialogType = 'edit'
      this.title = 'edit category'
      this.dialogFormVisible = true

      this.$http({
        url: this.$http.adornUrl(`/product/category/info/${data.catId}`),
        method: 'get'
      }).then(({data}) => {
        console.log('data to be echoed', data)
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
      console.log('edited data to be uploaded', {catId, name, icon, productUnit})
      this.$http({
        url: this.$http.adornUrl(`/product/category/update`),
        method: 'post',
        data: this.$http.adornData({catId, name, icon, productUnit}, false)
      }).then(({data}) => {
        this.$message({
          message: 'successfully edited data',
          type: 'success'
        })
        this.dialogFormVisible = false
        this.getMenus()
        this.expandedKey = [this.category.parentCid]
      })
    },
    append(data) {
      console.log('append', data)
      this.title = 'append category'
      this.dialogFormVisible = true
      this.category.parentCid = data.catId
      this.category.catLevel = data.catLevel * 1 + 1

      this.category.name = ''
      this.category.catId = null
      this.category.icon = ''
      this.category.productUnit = ''
      this.category.showStatus = 1
      this.category.sort = 0
    },
    addCategory() {
      console.log('category', this.category)
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
      this.$confirm(`delete [${data.name}?]`, 'notification', {
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
