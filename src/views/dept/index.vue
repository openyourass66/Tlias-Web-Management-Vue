<script setup>
import { ElMessage,ElMessageBox} from 'element-plus'
import { onMounted, ref } from 'vue'
import { queryAllApi,addApi,queryByIdApi,updateApi,deleteByIdApi} from '../../api/dept';
onMounted( () =>{
  search()
})
const search=async()=>{
  const result = await queryAllApi()
  if(result.code){
    deptList.value=result.data
  }
}
const deptList =ref([])
// dialog对话框
const dialogFormVisible = ref(false)
const dept = ref({name:''})
const formTitle = ref('')
const addDept=()=>{ 
  dialogFormVisible.value=true
  formTitle.value='新增部门'
  //重置校验规则
  if(deptFormRef.value){
    deptFormRef.value.resetFields()
  }
}
const save = async () => {
  if(!deptFormRef.value) return
  deptFormRef.value.validate(async(valid)=>{ //valid表示检验是否通过
    if(valid){
      let result
      if(dept.value.id){//编辑部门
        result = await updateApi(dept.value)
      }else{
        result = await addApi(dept.value)
      }
      
      if(result.code){
        ElMessage.success("操作成功")
        dialogFormVisible.value=false
        dept.value={name:''}
        search()
      }else{
        ElMessage.error(result.message)
      }
    }else{
      ElMessage.error("请填写正确的部门信息")
    }
  })
  
}
//表单校验规则
const rules = ref({
  name: [
    { required: true, message: '部门为空', trigger: 'blur' },
    { min: 3, max: 10, message: '部门名称长度在2-10位', trigger: 'blur' },
  ]
})
const deptFormRef=ref()
//编辑部门
const edit=async(id)=>{ 
  formTitle.value='编辑部门'
  if(deptFormRef.value){
    deptFormRef.value.resetFields()
  }
  const result = await queryByIdApi(id)
  if(result.code){
    dialogFormVisible.value=true
    dept.value=result.data
    
  }
}
//删除部门
const deleteById=async(id)=>{ 
  ElMessageBox.confirm(
    '确认删除该部门？',
    '提示',
    {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(async() => {//确认
    const result = await deleteByIdApi(id)
    if(result.code){
      ElMessage.success("删除成功")
      search()
    }else{
      ElMessage.error(result.message)
    }
    })
  .catch(() => {//取消
    ElMessage.info('取消删除')
    })
}
</script>

<template>
  <h1>部门管理</h1>
  <div class="container">
    <el-button type="primary" @click="addDept">+新增部门</el-button>
  </div>
  <div class="container">
    <el-table :data="deptList" border style="width: 100%">
      <el-table-column type="index" label="序号" width="100" align="center"/>
      <el-table-column prop="name" label="部门名称" width="260" align="center" />
      <el-table-column prop="updateTime" label="最后操作时间" width="300" align="center" />
      <el-table-column label="操作" align="center">
        <template #default="scope">
            <el-button @click="edit(scope.row.id)" type="primary" size="small"><el-icon><Edit /></el-icon>编辑</el-button>
            <el-button @click="deleteById(scope.row.id)" type="danger" size="small" ><el-icon><Delete /></el-icon>删除</el-button>
        </template>
      </el-table-column>
      </el-table>
  </div>
   <el-dialog  v-model="dialogFormVisible" :title="formTitle" width="500">
    <el-form :model="dept" :rules="rules" ref="deptFormRef">
      <el-form-item label="部门名称" label-width="80px" prop="name">
        <el-input v-model="dept.name"/>
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogFormVisible = false,dept.name=''">取消</el-button>
        <el-button type="primary" @click="save">确定</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<style scoped>
.container{
  margin:10px 0px;
}
</style>
