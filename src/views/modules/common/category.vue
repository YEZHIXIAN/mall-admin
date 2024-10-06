<template>
  <el-tree
    :data="categories"
    :props="defaultProps"
    node-key="catId"
    ref="menuTree"
    @node-click="nodeClick"
  ></el-tree>
</template>

<script>
export default {
  components: {},
  props: {},
  data() {
    return {
      categories: [],
      expandedKey: [],
      defaultProps: {
        children: 'subcategories',
        label: 'name'
      }
    }
  },
  methods: {
    nodeClick(data, node, component) {
      console.log('data', {data, node, component})
      this.$emit('tree-node-click', data, node, component)
    },
    getMenus() {
      this.$http({
        url: this.$http.adornUrl('/product/category/list/tree'),
        method: 'get'
      }).then(({data}) => {
        this.categories = data.data
      })
    }
  },
  created() {
    this.getMenus();
  }
}
</script>
