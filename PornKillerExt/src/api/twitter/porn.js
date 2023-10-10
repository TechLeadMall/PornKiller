import request from '@/utils/request'

// 查询黄推列表列表
export function listPorn(query) {
  return request({
    url: '/twitter/porn/list',
    method: 'get',
    params: query
  })
}

// 查询黄推列表详细
export function getPornList(kind) {
  return request({
    url: '/twitter/porn/getPornList/' + kind,
    method: 'get'
  })
}
// 查询黄推列表详细
export function getPorn(id) {
  return request({
    url: '/twitter/porn/' + id,
    method: 'get'
  })
}

// 新增黄推列表
export function addPorn(data) {
  return request({
    url: '/twitter/porn',
    method: 'post',
    data: data
  })
}
export function updateUserBlock(data) {
  return request({
    url: '/twitter/porn/updateUserBlockList',
    method: 'post',
    data: data
  })
}
export function updateUserResume(data) {
  return request({
    url: '/twitter/porn/updateUserResumeList',
    method: 'post',
    data: data
  })
}

// 修改黄推列表
export function updatePorn(data) {
  return request({
    url: '/twitter/porn',
    method: 'put',
    data: data
  })
}

// 删除黄推列表
export function delPorn(id) {
  return request({
    url: '/twitter/porn/' + id,
    method: 'delete'
  })
}
