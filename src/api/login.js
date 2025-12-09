import request from "../util/request"
export const loginApi=(data)=> request.post("/login",data)