<script setup>
import {onMounted, ref,watch} from 'vue'
import {queryPageApi,addApi,queryByIdApi,updateApi,deleteByIdsApi} from '../../api/emp'
import {ElMessage,ElMessageBox} from 'element-plus'
import {queryAllApi as queryAllDeptApi} from '../../api/dept'
const searchEmp=ref({
  name:'',
  gender:'',
  date:[],
  begin:'',
  end:'' 

})
const deptList = ref([])
onMounted( () =>{
  search()//查询员工
  queryDept()//查询部门
})
const queryDept=async () => {
  const result = await queryAllDeptApi()
  if(result.code){
    deptList.value=result.data
  }
}
//侦听
watch(() => searchEmp.value.date, (newVal) => {
  if (newVal && newVal.length == 2) {
    searchEmp.value.begin = newVal[0]
    searchEmp.value.end = newVal[1]
  } else {
    searchEmp.value.begin = ''
    searchEmp.value.end = ''
  }

})
//查询
const search = async () => { 
  const result = await queryPageApi
  (searchEmp.value.name,
  searchEmp.value.gender,
  searchEmp.value.begin,
  searchEmp.value.end,
  currentPage.value,
  pageSize.value)
  if(result.code){
    empList.value=result.data.rows
    total.value=result.data.total
  }
}
//清空
const clear = () => { 
  searchEmp.value={
    name:'',
    gender:'',
    date:[],
    begin:'',
    end:''
  }
  search()
}
//员工列表
const empList=ref([])
//分页操作
const currentPage = ref(1)//页码
const pageSize = ref(10)//每页显示的记录数
const background = ref(true)//是否使用背景色
const total = ref(0) //总记录数
//每页展示记录数变化
const  handleSizeChange=()=>{ 
  search()
}
//页码变化
const handleCurrentChange=()=>{ 
  search()
}
// //新增/修改表单
const employee = ref({
  username: '',
  name: '',
  gender: '',
  phone: '',
  job: '',
  salary: '',
  deptId: '',
  entryDate: '',
  image: '',
  exprList: []
})
const addEmp=()=>{
  dialogVisible.value = true
  dialogTitle.value = '新增员工'
  employee.value = {
    username: '',
    name: '',
    gender: '',
    phone: '',
    job: '',
    salary: '',
    deptId: '',
    entryDate: '',
    image: '',
    exprList: []
  }
  //重置校验规则
  if(employeeFormRef.value){
    employeeFormRef.value.resetFields()
  }
}
// 控制弹窗
const dialogVisible = ref(false)
const dialogTitle = ref('新增员工')

//文件上传
// 图片上传成功后触发
const handleAvatarSuccess = (response) => {
  employee.value.image=response.data
}
// 文件上传之前触发
const beforeAvatarUpload = (rawFile) => {
  if (rawFile.type !== 'image/jpeg' && rawFile.type !== 'image/png') {
    ElMessage.error('只支持上传图片')
    return false
  } else if (rawFile.size / 1024 / 1024 > 10) {
    ElMessage.error('只能上传10M以内图片')
    return false
  }
  return true
}
//职位列表数据
const jobs = ref([{ name: '班主任', value: 1 },{ name: '讲师', value: 2 },{ name: '学工主管', value: 3 },{ name: '教研主管', value: 4 },{ name: '咨询师', value: 5 },{ name: '其他', value: 6 }])
//性别列表数据
const genders = ref([{ name: '男', value: 1 }, { name: '女', value: 2 }])
//添加工作经历
const addExprItem=()=>{
  employee.value.exprList.push({
    company: '',
    job: '',
    begin: '',
    end: '',
    exprDate:[]
  })
}
//删除工作经历
const deleteExprItem=(index)=>{
  employee.value.exprList.splice(index,1)
}
//监听工作经历
watch(() => employee.value.exprList, (newVal) => {
  newVal.forEach(expr => {
    // 只有当 exprDate 有值时才更新 begin 和 end
    if (expr.exprDate && expr.exprDate.length === 2) {
      expr.begin = expr.exprDate[0]
      expr.end = expr.exprDate[1]
    }
  })
}, { deep: true })
const employeeFormRef = ref(null)//表单对象
//保存员工
const save=async()=>{
  //验证表单
  if(!employeeFormRef.value) return
  employeeFormRef.value.validate(async(valid)=>{ //valid表示检验是否通过
    if(valid){ //验证通过
      let result
      if(employee.value.id){//编辑员工
        result = await updateApi(employee.value)
      }else{
        result = await addApi(employee.value)
      }
      
      if(result.code){
        ElMessage.success("保存成功")
        dialogVisible.value=false
        search()
      }else{
        ElMessage.error(result.message)
      }
    }else{ //验证失败
      ElMessage.error("请填写正确的数据")
    }
  })

}
//表单校验规则
const rules = ref({
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 2, max: 20, message: '用户名长度应在2到20个字符之间', trigger: 'blur' }
  ],
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' },
    { min: 2, max: 10, message: '姓名长度应在2到10个字符之间', trigger: 'blur' }
  ],
  gender: [
    { required: true, message: '请选择性别', trigger: 'change' }
  ]
  // phone: [
  //   { required: true, message: '请输入手机号', trigger: 'blur' },
  //   { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号', trigger: 'blur' }
  // ]
});
//修改员工
const edit = async (id) => { 
  const result = await queryByIdApi(id)
  if (result.code) { 
    dialogVisible.value = true
    dialogTitle.value = '修改员工'
    employee.value=result.data
    //处理工作经历
    let exprList=employee.value.exprList
    if(exprList && exprList.length>0){
      exprList.forEach((expr) =>{
        expr.exprDate=[expr.begin,expr.end]
      })
    }
  }
}
//删除员工
const deleteById = async (id) => { 
  ElMessageBox.confirm(
    '确认删除该员工？',
    '提示',
    {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(async() => {//确认
    const result = await deleteByIdsApi(id)
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
//勾选的员工id
const selectIds = ref([])
//复选框变化时触发 selection:当前选中的记录数组
const handleSelectionChange = (selection) => {
  selectIds.value=selection.map(emp=>emp.id)
}
//批量删除员工
const deleteByIds=async()=>{ 
  if(selectIds.value.length>0){
      ElMessageBox.confirm(
      '确认删除员工？',
      '提示',
      {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning',
      }
    ).then(async() => {//确认
        const result = await deleteByIdsApi(selectIds.value)
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
  }else{
    ElMessage.info('请选择要删除的部门')
  }
  
}
</script>

<template>
  员工管理
  <!-- 查询栏  -->
  <div class="container">
    <el-form :inline="true" :model="searchEmp" class="demo-form-inline">
      <el-form-item label="姓名">
        <el-input v-model="searchEmp.name" placeholder="请输入员工姓名"  />
      </el-form-item>
      <el-form-item label="性别">
        <el-select v-model="searchEmp.gender" placeholder="请选择">
          <el-option label="男" value="1" />
          <el-option label="女" value="2" />
        </el-select>
      </el-form-item>
      <el-form-item label="入职时间">
        <el-date-picker
        v-model="searchEmp.date"
        type="daterange"
        range-separator="到"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        value-format="YYYY-MM-DD" 
      />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="search">查询</el-button>
        <el-button type="primary" @click="clear">清空</el-button>
      </el-form-item>
    </el-form>
  </div>
  <!-- 功能 -->
  <div class="container">
    <el-button type="primary" @click="addEmp">新增员工</el-button>
    <el-button type="error" @click="deleteByIds">批量删除</el-button>
  </div>
  <!-- 数据展示表格 -->
  <div class="container">
    <el-table :data="empList" border style="width: 100%" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
    <el-table-column prop="name" label="姓名" width="120" align="center" />
    <el-table-column prop="gender" label="性别" width="120" align="center">
      <template #default="scope">
        {{ scope.row.gender==1?'男':'女' }}
      </template>
    </el-table-column>
    <el-table-column prop="image" label="头像" width="120" align="center">
      <template #default="scope">
        <img :src="scope.row.image" height="40px" >
      </template>
    </el-table-column>
    <el-table-column prop="entryDate" label="所属部门" width="120" align="center" />
    <el-table-column prop="job" label="职位" width="120">
        <template #default="scope">
          <span v-if="scope.row.job==1">班主任</span>
          <span v-else-if="scope.row.job==2">讲师</span>
          <span v-else-if="scope.row.job==3">学工主管</span>
          <span v-else-if="scope.row.job==4">教研主管</span>
          <span v-else-if="scope.row.job==5">咨询师</span>
          <span v-else>其他</span>
        </template>
    </el-table-column>
    <el-table-column prop="entryDate" label="入职日期" width="180" align="center" />
    <el-table-column prop="updateTime" label="最后操作日期" width="200"  align="center"/>
    <el-table-column  label="操作" align="center">
      <template #default="scope">
            <el-button @click="edit(scope.row.id)" type="primary" size="small"><el-icon><Edit /></el-icon>编辑</el-button>
            <el-button @click="deleteById(scope.row.id)" type="danger" size="small" ><el-icon><Delete /></el-icon>删除</el-button>
        </template>
    </el-table-column>
  </el-table>
  </div>
   <!-- 分页 -->
  <div class="container">
     <el-pagination
      v-model:current-page="currentPage"
      v-model:page-size="pageSize"
      :page-sizes="[10,20,30,50,75,100]"
      :background="background"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />
  </div>
  <!-- 新增/修改员工的对话框 -->
  <el-dialog v-model="dialogVisible" :title="dialogTitle">
      <el-form ref="employeeFormRef" :rules="rules" :model="employee" label-width="80px">
        <!-- 基本信息 -->
        <!-- 第一行 -->
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="用户名" prop="username">
              <el-input v-model="employee.username" placeholder="请输入员工用户名，2-20个字"></el-input>
            </el-form-item>
          </el-col>
          
          <el-col :span="12">
            <el-form-item label="姓名" prop="name">
              <el-input v-model="employee.name" placeholder="请输入员工姓名，2-10个字"></el-input>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 第二行 -->
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="性别" prop="gender">
              <el-select v-model="employee.gender" placeholder="请选择性别" style="width: 100%;">
                <el-option v-for="gender in genders" :key="gender.value" :label="gender.name" :value="gender.value"></el-option>
              </el-select>
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="手机号" prop="phone">
              <el-input v-model="employee.phone" placeholder="请输入员工手机号"></el-input>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 第三行 -->
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="职位">
              <el-select v-model="employee.job" placeholder="请选择职位" style="width: 100%;">
                <el-option v-for="job in jobs" :key="job.value" :label="job.name" :value="job.value"></el-option>

              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="薪资">
              <el-input v-model="employee.salary" placeholder="请输入员工薪资"></el-input>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 第四行 -->
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="所属部门">
              <el-select v-model="employee.deptId" placeholder="请选择部门" style="width: 100%;">
                <el-option v-for="dept in deptList" :key="dept.id" :label="dept.name" :value="dept.id"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="入职日期">
              <el-date-picker v-model="employee.entryDate" type="date" style="width: 100%;" placeholder="选择日期" format="YYYY-MM-DD" value-format="YYYY-MM-DD"></el-date-picker>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 第五行 -->
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="头像">
              <el-upload
                class="avatar-uploader"
                action="/api/upload"
                :show-file-list="false"
                :on-success="handleAvatarSuccess"
                :before-upload="beforeAvatarUpload"
                >
                <img v-if="employee.image" :src="employee.image" class="avatar" />
                <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
              </el-upload>
            </el-form-item>
          </el-col>
        </el-row>
        

        <!-- 工作经历 -->
        <!-- 第六行 -->
        <el-row :gutter="10">
          <el-col :span="24">
            <el-form-item label="工作经历">
              <el-button type="success" size="small" @click="addExprItem">+ 添加工作经历</el-button>
            </el-form-item>
          </el-col>
        </el-row>
        
        <!-- 第七行 ...  工作经历 -->
        <el-row v-for="(expr,index) in employee.exprList" :gutter="3">
          <el-col :span="10">
            <el-form-item size="small" label="时间" label-width="80px">
              <el-date-picker v-model="expr.exprDate" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" format="YYYY-MM-DD" value-format="YYYY-MM-DD" ></el-date-picker>
            </el-form-item>
          </el-col>

          <el-col :span="6">
            <el-form-item size="small" label="公司" label-width="60px">
              <el-input v-model="expr.company" placeholder="请输入公司名称"></el-input>
            </el-form-item>
          </el-col>

          <el-col :span="6">
            <el-form-item size="small" label="职位" label-width="60px">
              <el-input v-model="expr.job" placeholder="请输入职位"></el-input>
            </el-form-item>
          </el-col>

          <el-col :span="2">
            <el-form-item size="small" label-width="0px">
              <el-button @click="deleteExprItem(index)" type="danger" >- 删除</el-button>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      
      <!-- 底部按钮 -->
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="save">保存</el-button>
        </span>
      </template>
    </el-dialog>

</template>

<style scoped>
  .container{
    margin: 10px 0px;
  }
  .avatar {
  height: 40px;
}
.avatar-uploader .avatar {
  width: 78px;
  height: 78px;
  display: block;
}
.avatar-uploader .el-upload {
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
}

.avatar-uploader .el-upload:hover {
  border-color: var(--el-color-primary);
}

.el-icon.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 78px;
  height: 78px;
  text-align: center;
  /* 添加灰色的虚线边框 */
  border: 1px dashed var(--el-border-color);
}

</style>